// NodeJS Imports
import { mkdir } from 'node:fs/promises'

// External Modules imports
import { union } from 'lodash-es'

// Internal Modules
import StylesUtils from './StylesUtils.js'

class ComponentUtils {

  /**
   *
   * @param {Section|Snippet} component
   * @return {Promise<void>}
   */
  static async createFolderStructure (component) {
    await mkdir(`${component.rootFolder}/src/locales`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/scripts`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/styles`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/snippets`, { recursive: true })
  }

  /**
   * Get Snippet Root Folders From Section/Snippet Renders
   * @param {Render[]} renders
   * @return {string[]}
   */
  static getSnippetRootFoldersFromRenders (renders) {
    let snippetRootFolders = []
    for (const render of renders) {
      if (render.snippet) {
        if (render.snippet.rootFolder && !snippetRootFolders.includes(render.snippet.rootFolder)) {
          snippetRootFolders.push(render.snippet.rootFolder)
        }
        if (render.snippet.renders && render.snippet.renders.length > 0) {
          const childSnippetRootFolders = this.getSnippetRootFoldersFromRenders(render.snippet.renders)
          snippetRootFolders = union(snippetRootFolders, childSnippetRootFolders)
        }
      }
    }
    return snippetRootFolders
  }

  /**
   * Get Component Main Stylesheet
   * @param {Component} component
   */
  static getMainStylesheet (component) {
    if (component.files.mainStylesheet) {
      if (StylesUtils.isSassFile(component.files.mainStylesheet)) {
        return component.build.stylesheet
      } else {
        return component.files.mainStylesheet
      }
    }

  }

}

export default ComponentUtils
