import * as fs from 'node:fs'

import logger from './logger.js'
import { getCollectionNodes, getThemeNodes } from './nodes.js'
import { ComponentMap, LiquidNode } from './types.js'

export function getComponentMap(path: string): ComponentMap {
  const data: ComponentMap = { collections: {}, files: { assets: {}, snippets: {} } }

  if (fs.existsSync(path)) {
    const componentMapContent = fs.readFileSync(path, 'utf8')
    const parsedContent = JSON.parse(componentMapContent)
    data.collections = parsedContent.collections || {}
    data.files.assets = parsedContent.files?.assets || {}
    data.files.snippets = parsedContent.files?.snippets || {}
  }

  return data
}

export function generateComponentFilesMap(
  oldFilesMap: ComponentMap['files'],
  themeDir: string, 
  collectionDir: string,
  collectionName: string,
  ignoreConflicts: boolean,
  ignoreOverrides: boolean
): ComponentMap['files'] {
  const collectionNodes = getCollectionNodes(collectionDir)
  const themeNodes = getThemeNodes(themeDir)
  const entryPointNodes = themeNodes.filter(node => node.type === 'entry')

  const newFilesMap: ComponentMap['files'] = {
    assets: {},
    snippets: {}
  }

  for (const node of themeNodes) {
    // Add theme nodes not present in the old import map
    // They have been added manually by the user since the last time the import map was generated
    if ((node.type === 'snippet' || node.type === 'asset') && !oldFilesMap[node.themeFolder]?.[node.name]) {
        const collectionNode = collectionNodes.find(n => n.themeFolder === node.themeFolder && n.name === node.name)

        if (collectionNode) {
          if (ignoreConflicts) {
            // If the user has passed the --ignore-conflicts flag, skip the node so it can be logged later as a component entry
            continue;
          } else {
            // If the node also exists in the collection, warn the user of the potential conflict but keep as a @theme entry
            newFilesMap[node.themeFolder][node.name] = '@theme'
            logger.log(`Conflict Warning: Pre-existing file ${node.themeFolder}/${node.name} without mapping conflicts with file in ${collectionName}. Keeping the theme file.`)
          }
        } else {
          // If the node does not exist in the collection, add it to the new import map as a @theme entry
          newFilesMap[node.themeFolder][node.name] = '@theme'
        }
      }

    // Persist prexisting asset entries from @theme or other collections
    if (node.type === 'asset') {
      const oldImportMapValue = oldFilesMap[node.themeFolder]?.[node.name]
      if (oldImportMapValue !== collectionName && typeof oldImportMapValue === 'string') {
        newFilesMap[node.themeFolder][node.name] = oldImportMapValue
      }
    }
  }

  function addFilesMapEntry(themeFolder: LiquidNode['themeFolder'], name: string) {
    const oldImportMapValue = oldFilesMap[themeFolder]?.[name]
    const newImportMapValue = newFilesMap[themeFolder]?.[name]

    // If the new import map value is already defined, we don't need to add it again
    if (newImportMapValue !== undefined) return

    if (oldImportMapValue !== collectionName && typeof oldImportMapValue === 'string') {
      // If the import map value is not our collection but is defined
      let node = themeNodes.find(node => node.themeFolder === themeFolder && node.name === name)
      if (node) {
        const collectionNode = collectionNodes.find(node => node.themeFolder === themeFolder && node.name === name)
        if (collectionNode) {
          // If the node also exists in the collection, it's considered an override
          if (ignoreOverrides) {
            // If the user has passed the --ignore-overrides, set the new import map value to the collection name
            newFilesMap[node.themeFolder][node.name] = collectionName
            node = collectionNode
          } else {
            // If the user has not passed the --ignore-overrides flag, keep the override
            newFilesMap[node.themeFolder][node.name] = oldImportMapValue
            logger.log(`Override Warning: ${node.themeFolder}/${node.name} is being overridden by the collection ${collectionName}.`)
          }
        } else {
          // If the node does not exist in the collection, add it to the new import map
          newFilesMap[node.themeFolder][node.name] = oldImportMapValue
        }

        if (node.themeFolder === 'snippets') {
          // If the node is a snippet, add its snippets to the new import map
          for (const snippet of node.snippets) {
            addFilesMapEntry('snippets', snippet)
          }
        }
      }
    } else if (oldImportMapValue === collectionName || oldImportMapValue === undefined) {
      // If the import map value is set our collection or undefined
      const node = collectionNodes.find(node => node.themeFolder === themeFolder && node.name === name)
      if (node) {
        // If the node exists in the collection, add it to the new import map
        newFilesMap[node.themeFolder][node.name] = collectionName
        if (node.type === 'component') {
          // If the node is a component, add its assets to the new import map
          for (const asset of node.assets) addFilesMapEntry('assets', asset)
        }

        if (node.themeFolder === 'snippets') {
          // If the node is a snippet, add its snippets to the new import map
          for (const snippet of node.snippets) {
            addFilesMapEntry('snippets', snippet)
          }
        }
      }
    }
  }

  // Build out the import map for the theme and collection
  for (const node of entryPointNodes) {
    for (const snippet of node.snippets) {
      addFilesMapEntry('snippets', snippet)
    }
  }

  return newFilesMap
}