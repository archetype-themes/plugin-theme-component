import path from 'node:path'

import { copyFileIfChanged, writeFileIfChanged } from './files.js'
import logger from './logger.js'
import { getCollectionNodes } from './nodes.js'
import { DeepObject, deepMerge } from './objects.js'
import { LiquidNode } from './types.js'

export async function copySetupComponentFiles(
  collectionDir: string,
  destination: string,
  componentSelector: string
): Promise<void> {
  const collectionNodes = await getCollectionNodes(collectionDir)
  const setupFiles = collectionNodes
    .filter(node => componentSelector === '*' || componentSelector.includes(path.basename(node.file, '.liquid')))
    .flatMap(node => node.setup)

  const settingsSchema: object[] = []
  const settingsData: DeepObject = {}

  // Process all files in parallel
  await Promise.all(setupFiles.map(async (setupFile) => {
    const node = collectionNodes.find(n => n.file === setupFile)
    if (!node) return

    if (node.name === 'settings_schema.json') {
      const schemaItems = await processSettingsSchema(setupFile, node)
      settingsSchema.push(...schemaItems)
    } else if (node.name === 'settings_data.json') {
      const dataItems = await processSettingsData(setupFile, node)
      deepMerge(settingsData, dataItems)
    } else {
      copyFileIfChanged(node.file, path.join(destination, node.themeFolder, node.name))
    }
  }))

  // Write combined settings schema
  writeFileIfChanged(
    JSON.stringify(settingsSchema),
    path.join(destination, 'config', 'settings_schema.json')
  )

  // Write combined settings data
  writeFileIfChanged(
    JSON.stringify(settingsData),
    path.join(destination, 'config', 'settings_data.json')
  )
}

export async function processSettingsSchema(
  setupFile: string,
  node: LiquidNode
): Promise<object[]> {
  if (node?.name !== 'settings_schema.json') {
    return []
  }

  try {
    const schema = JSON.parse(node.body)
    if (!Array.isArray(schema)) {
      logger.warn(`Invalid schema format in ${setupFile}: Expected an array`)
      return []
    }

    return schema
  } catch (error) {
    logger.warn(`Failed to parse settings schema from ${setupFile}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return []
  }
}

export async function processSettingsData(
  setupFile: string,
  node: LiquidNode
): Promise<DeepObject> {
  if (node?.name !== 'settings_data.json') {
    return {}
  }

  try {
    const data = JSON.parse(node.body)
    if (typeof data !== 'object' || data === null) {
      logger.warn(`Invalid settings data format in ${setupFile}: Expected an object`)
      return {}
    }

    return data as DeepObject
  } catch (error) {
    logger.warn(`Failed to parse settings data from ${setupFile}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {}
  }
}
