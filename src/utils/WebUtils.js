import https from 'node:https'
import { join, basename } from 'node:path'
import FileUtils from './FileUtils.js'

const URL_REGEX = /^(http:\/\/|https:\/\/|\/\/)/

class WebUtils {
  /**
   * Download a list of files to a target folder
   * @param {string[]} remoteFiles
   * @param {string} targetFolder
   */
  static async downloadFiles (remoteFiles, targetFolder) {
    const downloadPromises = remoteFiles.map(file => this.downloadFile(file, targetFolder))

    return Promise.all(downloadPromises)
  }

  /**
   * Download a file to a target folder
   * @param {string} remoteFile
   * @param {string} targetFolder
   */
  static async downloadFile (remoteFile, targetFolder) {
    return new Promise((resolve, reject) => {
      https.get(remoteFile, (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          resolve(FileUtils.writeFile(join(targetFolder, basename(remoteFile)), data))
        })
      }).on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * Check if a string is a URL
   * @param {string} possibleUrl
   */
  static isUrl (possibleUrl) {
    return URL_REGEX.test(possibleUrl)
  }

  static isRepoUrl (possibleRepoUrl) {
    return /github\.com/.test(possibleRepoUrl)
  }
}

export default WebUtils

export const isRepoUrl = WebUtils.isRepoUrl
export const isUrl = WebUtils.isUrl
