// NodeJs imports
import { mkdir, rm } from 'node:fs/promises'

// Archie imports
import StylesProcessor from '../processors/StylesProcessor.js'
import FileUtils from '../utils/FileUtils.js'
import StylesUtils from '../utils/StylesUtils.js'
import BuildFactory from '../factory/BuildFactory.js'

class SnippetBuilder {
  /**
   * Build Snippet
   * @param {Snippet} snippet
   * @param {string} collectionRootFolder
   */
  static async build (snippet, collectionRootFolder) {
    // Generate build elements
    snippet.build = BuildFactory.fromSnippet(snippet)

    await this.resetBuildFolders(snippet.files, snippet.build)

    if (snippet.files.mainStylesheet && StylesUtils.isSassFile(snippet.files.mainStylesheet)) {
      snippet.build.styles = await StylesProcessor.buildStyles(snippet.files.mainStylesheet, snippet.build.stylesheet, collectionRootFolder)
      await FileUtils.writeFile(snippet.build.stylesheet, snippet.build.styles)
    }
  }

  /**
   * Build Snippets Recursively
   * @param {Render[]} renders
   * @param {string} collectionRootFolder
   * @param {string[]} [processedSnippets=[]]
   */
  static async buildMany (renders, collectionRootFolder, processedSnippets = []) {
    for (const render of renders) {
      if (!processedSnippets.includes(render.snippetName)) {
        await SnippetBuilder.build(render.snippet, collectionRootFolder)

        processedSnippets.push(render.snippetName)
      }

      if (render.snippet.renders) {
        await this.buildMany(render.snippet.renders, collectionRootFolder, processedSnippets)
      }
    }
  }

  /**
   *
   * @param {SnippetFiles} snippetFiles
   * @param {SnippetBuild} snippetBuild
   */
  static async resetBuildFolders (snippetFiles, snippetBuild) {
    await rm(snippetBuild.rootFolder, { force: true, recursive: true })

    if (snippetFiles.stylesheets.length > 0 && StylesUtils.isSassFile(snippetFiles.mainStylesheet)) {
      await mkdir(snippetBuild.rootFolder, { recursive: true })
      await mkdir(snippetBuild.assetsFolder, { recursive: true })
    }
  }
}

export default SnippetBuilder
