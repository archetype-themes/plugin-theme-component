import {Args as OclifArgs} from '@oclif/core'
import { ArgInput } from '@oclif/core/interfaces'
import {glob} from 'glob'
import fs from 'node:fs'
import path from 'node:path'

import logger from './logger.js'

export default class Args {
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  static readonly COMPONENT_SELECTOR = 'componentSelector'
  static readonly THEME_DIR = 'themeDir'

  constructor(args: Record<string, ArgInput<object>>) {
    Object.assign(this, args)
  }

  static getDefinitions(keys: (Record<string, ArgInput<object>> | string)[]) {
    return Object.fromEntries(
      keys.map(key => typeof key === 'string' ? [key, argDefinitions[key]] : Object.entries(key)[0])
    )
  }

  static override(key: string, options: Record<string, boolean | string>) {
    return { [key]: { ...argDefinitions[key], ...options } }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const argDefinitions: Record<string, any> = {
  [Args.COMPONENT_SELECTOR]: OclifArgs.string({
    default: '*', 
    description: 'component name or names (comma-separated) or "*" for all components', 
    async parse(input: string): Promise<string> {
      logger.debug(`Parsing component selector argument '${input}'`)
      // Allow * as a valid pattern
      if (input === '*') {
        logger.debug('Component selector * is valid')
        return input
      }

      logger.debug('Component name(s) provided. Checking if component selector is valid')
      const validComponentName = /^[\w-]+$/
      const components = input.split(',').map(name => name.trim())
      const invalidNames = components.filter(name => !validComponentName.test(name))
      if (invalidNames.length > 0) {
        logger.error(new Error(`Invalid component name(s): ${invalidNames.join(', ')}. Component names can only contain letters, numbers, hyphens, and underscores.`), {exit: 1})
      }

      logger.debug('Checking if provided components exist in collection')
      const availableComponents = await glob('*/', {cwd: 'components'})
        .then(dirs => dirs.map((dir: string) => dir.replace('/', '')))
      const missingComponents = components.filter(name => !availableComponents.includes(name))
      if (missingComponents.length > 0) {
        logger.warn(new Error(`Component(s) not found in collection: ${missingComponents.join(', ')}.`))
      } else {
        logger.debug('All provided components exist in collection')
      }

      return input
    },
    required: false
  }),

  [Args.THEME_DIR]: OclifArgs.string({
    description: 'path to theme directory', 
    async parse(input: string): Promise<string> {
      logger.debug(`Parsing theme directory argument '${input}'`)
      const requiredFolders = ['layout', 'templates', 'config']
      let isThemeDirectory = true

      for (const folder of requiredFolders) {
        if (!fs.existsSync(path.join(input, folder))) {
          isThemeDirectory = false
        }
      }

      if (!isThemeDirectory) {
        logger.error(new Error(`The provided path ${input} does not appear to contain valid theme files.`), {exit: 1})
      }

      logger.debug(`Theme directory ${input} appears to be valid`)
      return input
    },
    required: true
  })
} 