import RecursionError from '../errors/RecursionError.js'
import Render from '../models/Render.js'
import LiquidUtils from '../utils/LiquidUtils.js'
import logger from '../utils/Logger.js'

class RenderFactory {

  /**
   * Create Render Models From Component By Searching Through The Liquid Code For Render Tags
   * @param {string} liquidCode
   * @param {string} [sourceSnippetName]
   * @return {Render[]}
   */
  static fromLiquidCode (liquidCode, sourceSnippetName) {
    // Parse and prepare Render models from liquid code
    const renderTags = LiquidUtils.findRenderTags(liquidCode)

    if (renderTags.length > 0) {
      if (sourceSnippetName) {
        this.validateSnippetRecursion(sourceSnippetName, renderTags)
      }

      return this.fromRenderTags(renderTags)
    }

    return []
  }

  /**
   * Create Renders from Liquid Code
   * @param {RegExpMatchArray[]} renderTags
   * @return {Render[]}
   */
  static fromRenderTags (renderTags) {
    const renders = []

    for (const match of renderTags) {
      renders.push(this.fromRenderTag(match[0], match.groups))
    }

    return renders
  }

  /**
   * Create a Render Model instance from a render liquid tag
   * @param {string} matchText
   * @param {Object} matchGroups
   * @return {Render}
   */
  static fromRenderTag (matchText, matchGroups) {
    const render = new Render()

    if (!matchGroups.snippet) {
      throw new Error('Expected name of snippet is empty')
    }
    render.snippetName = matchGroups.snippet
    render.liquidTag = matchText

    if (matchGroups.clause) {
      render.clause = matchGroups.clause
      render.clauseSourceVariable = matchGroups.clauseSourceVariable
      render.clauseTargetVariable = matchGroups.clauseTargetVariable
    }

    if (matchGroups.variables && matchGroups.variables.length > 0) {
      const variables = []
      const variablesMatched = matchGroups.variables.split(',')

      for (const variableMatched of variablesMatched) {
        if (variableMatched.includes(':')) {
          const variable = variableMatched.split(':')
          variables[variable[0].trim()] = variable[1].trim()
        }
      }
      render.variables = variables
    }

    return render
  }

  /**
   * Validate Snippet Recursion
   * @param {string} snippetName
   * @param {RegExpMatchArray[]} renderTags
   */
  static validateSnippetRecursion (snippetName, renderTags) {
    for (const renderTag of renderTags) {
      if (renderTag.groups.snippet && renderTag.groups.snippet === snippetName) {
        logger.debug(renderTag)
        throw new RecursionError(`Snippet ${snippetName} is trying to render itself. Please verify your source code.`)
      }
    }
  }
}

export default RenderFactory
