import Render from '../models/Render.js'
import logger from '../utils/Logger.js'
import { exit } from 'node:process'

class RenderFactory {

  static fromMatch (matchText, matchGroups) {
    const render = new Render()
    console.log(matchGroups)
    if (!matchGroups.snippet) {
      logger.error('Expected name of snippet is empty')
      exit(1)
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
      console.log(variables)
    }
    console.log(render)
    return render
  }
}

export default RenderFactory
