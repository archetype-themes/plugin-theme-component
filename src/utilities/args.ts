import {Args as OclifArgs} from '@oclif/core'
import {glob} from 'glob'
import config from './config.js'
import logger from './logger.js'
import {isThemeDirectory} from './theme-files.js'

export let argDefinitions: Record<string, any>

export default class Args {
  [key: string]: any
  static readonly THEME_DIR = 'themeDir'
  static readonly COMPONENT_SELECTOR = 'componentSelector'

  private argValues: Record<string, any>
  constructor(args: Record<string, any>) {
    this.argValues = args
    return new Proxy(this, {
      get(target: Args, prop: string | symbol): any {
        if (prop in target) {
          return (target as any)[prop]
        }
        return target.argValues[prop.toString()]
      }
    })
  }

  static getDefinitions(keys: (string | Record<string, any>)[]) {
    return Object.fromEntries(
      keys.map(key => typeof key === 'string' ? [key, argDefinitions[key]] : Object.entries(key)[0])
    )
  }

  static override(key: string, options: Record<string, any>) {
    return { [key]: { ...argDefinitions[key], ...options } }
  }
}

argDefinitions = {
  [Args.THEME_DIR]: OclifArgs.string({
    description: 'path to theme directory', 
    required: true,
    parse: async (input: string): Promise<string> => {
      logger.debug(`Parsing theme directory argument '${input}'`)
      if (!isThemeDirectory(input)) {
        logger.error(new Error(`The provided path ${input} does not appear to contain valid theme files.`), {exit: 1})
      }
      logger.debug(`Theme directory ${input} appears to be valid`)
      return input
    }
  }),

  [Args.COMPONENT_SELECTOR]: OclifArgs.string({
    description: 'component name or names (comma-separated) or "*" for all components', 
    required: false, 
    default: '*',
    parse: async (input: string): Promise<string> => {
      logger.debug(`Parsing component selector argument '${input}'`)
      // Allow * as a valid pattern
      if (input === '*') {
        logger.debug('Component selector * is valid')
        return input
      }

      logger.debug('Component name(s) provided. Checking if component selector is valid')
      const validComponentName = /^[a-zA-Z0-9-_]+$/
      const components = input.split(',').map(name => name.trim())
      const invalidNames = components.filter(name => !validComponentName.test(name))
      if (invalidNames.length > 0) {
        logger.error(new Error(`Invalid component name(s): ${invalidNames.join(', ')}. Component names can only contain letters, numbers, hyphens, and underscores.`), {exit: 1})
      }

      logger.debug('Checking if provided components exist in collection')
      const availableComponents = await glob('*/', {cwd: config.COLLECTION_COMPONENT_DIR})
        .then(dirs => dirs.map((dir: string) => dir.replace('/', '')))
      const missingComponents = components.filter(name => !availableComponents.includes(name))
      if (missingComponents.length > 0) {
        logger.warn(new Error(`Component(s) not found in collection: ${missingComponents.join(', ')}.`))
      } else {
        logger.debug('All provided components exist in collection')
      }

      return input
    }
  })
} 