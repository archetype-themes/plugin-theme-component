import {Args as OclifArgs} from '@oclif/core'
import {glob} from 'glob'
import config from './config.js'
import logger from './logger.js'
import {isThemeDirectory} from './theme-files.js'

export default class Args {
  private argValues: Record<string, any>
  [key: string]: any

  constructor(args: Record<string, any>) {
    this.argValues = args
    return new Proxy(this, {
      get: (target, prop: string) => {
        if (prop in target) {
          return target[prop]
        }
        const group = Args.argDefinitions[prop as keyof typeof Args.argDefinitions]
        if (group) {
          const [key] = Object.keys(group)
          return target.argValues[key]
        }
      }
    })
  }

  static readonly THEME_DIR = 'THEME_DIR' as const
  static readonly COMPONENT_SELECTOR = 'COMPONENT_SELECTOR' as const

  static readonly argDefinitions = {
    [Args.THEME_DIR]: {
      themeDir: OclifArgs.string({
        description: 'path to theme directory', 
        required: true,
        parse: async (input: string): Promise<string> => {
          if (!isThemeDirectory(input)) {
            logger.error(new Error(`The provided path ${input} is not a valid theme directory.`), {exit: 1})
          }
          return input
        }
      })
    },

    [Args.COMPONENT_SELECTOR]: {
      componentSelector: OclifArgs.string({
        description: 'component name or names (comma-separated) or "*" for all components', 
        required: false, 
        default: '*',
        parse: async (input: string): Promise<string> => {
          // Allow * as a valid pattern
          if (input === '*') return input

          // For component names, only allow alphanumeric, hyphen, and underscore
          const validComponentName = /^[a-zA-Z0-9-_]+$/
          const components = input.split(',').map(name => name.trim())

          // Validate each component name format
          const invalidNames = components.filter(name => !validComponentName.test(name))
          if (invalidNames.length > 0) {
            throw new Error(`Invalid component name(s): ${invalidNames.join(', ')}. Component names can only contain letters, numbers, hyphens, and underscores.`)
          }

          // Get available components from the collection
          const availableComponents = await glob('*/', {cwd: config.COLLECTION_COMPONENT_DIR})
            .then(dirs => dirs.map((dir: string) => dir.replace('/', '')))

          // Check if all requested components exist
          const missingComponents = components.filter(name => !availableComponents.includes(name))
          if (missingComponents.length > 0) {
            throw new Error(`Component(s) not found in collection: ${missingComponents.join(', ')}.`)
          }

          return input
        }
      })
    }
  } as const

  static getDefinitions(argKeys: (keyof typeof Args.argDefinitions)[]): Record<string, any> {
    return argKeys.reduce((acc, key) => ({
      ...acc,
      ...Args.argDefinitions[key],
    }), {})
  }
} 