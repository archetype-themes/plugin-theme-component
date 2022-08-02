#! /usr/bin/env node
import FileUtils from '../utils/FileUtils.mjs'
import { loadOptions, transformFileAsync } from '@babel/core'
import logger from '../utils/Logger.js'
import { basename } from 'path'

class JavaScriptProcessor {
  constructor () {

  }

  get options () {
    return this._options
  }

  set options (options) {
    this._options = options
  }

  async loadDefaultOptions () {
    logger.debug('JSP - Loading Default Options')
    const babelConfig = await FileUtils.readFileOrDie(`${FileUtils.getRootFolderName()}/babel.config.json`)
    const parsedBabelConfig = JSON.parse(babelConfig)

    this.options = await loadOptions(parsedBabelConfig)
  }

  async babelifyFile (file) {
    logger.debug(`JSP - Babelify File "${basename(file)}"`)
    if (!this.options) {
      await this.loadDefaultOptions()
    }
    return await transformFileAsync(file, this.options)
  }

  async babelifyFiles (files) {
    logger.debug(`JSP - Babelifying ${files.length} Files`)
    const babelifiedFiles = []
    for (const file of files) {
      const { code } = await this.babelifyFile(file)
      babelifiedFiles[basename(file)] = code
    }
    return babelifiedFiles
  }

  async processJsFiles (jsFiles, outFile, jsFilesNotToMerge) {
    const files = await this.babelifyFiles(jsFiles)

    const processedFiles = []
    // Merge JS Files
    for (const filename in files) {
      const code = files[filename]

      // If already referenced in liquid by name, treat separately
      if (jsFilesNotToMerge && jsFilesNotToMerge.includes(filename)) {
        processedFiles[filename] = code
      } else {
        if (!processedFiles.hasOwnProperty(outFile)) {
          processedFiles[outFile] = `//${filename}\n${code}`
        } else {
          processedFiles[outFile] += `\n//${filename}\n${code}`
        }
      }
    }
    return processedFiles
  }

  async processJsModules (jsModules) {
    return await this.babelifyFiles(jsModules)
  }

}

export default JavaScriptProcessor