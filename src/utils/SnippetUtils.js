// External imports
import merge from 'deepmerge'

// Internal imports
import SectionSchema from '../models/SectionSchema.js'
import SectionSchemaUtils from './SectionSchemaUtils.js'
import { mergeObjectArraysByUniqueKey } from './ArrayUtils.js'

class SnippetUtils {
  /**
   * Get Components' Snippet Names
   * @param {(Component|Section|Snippet)[]}components
   * @returns {*[]}
   */
  static getSnippetNames (components) {
    const componentsWithSnippetNames = components.filter(component => component.snippetNames?.length)
    const snippetNames = (componentsWithSnippetNames.map(component => component.snippetNames)).flat()

    return [...new Set(snippetNames)]
  }

  /**
   * Build Section Schema Recursively
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {Object}
   */
  static buildSectionSchemaRecursively (snippets, processedSnippets = []) {
    let buildSchema = new SectionSchema()

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        // Merge Snippet schema
        if (snippet.build.schema) {
          buildSchema = SectionSchemaUtils.merge(buildSchema, snippet.build.schema)
        }

        // Recursively check child snippets for schema
        if (snippet.snippets?.length) {
          buildSchema = SectionSchemaUtils.merge(buildSchema, this.buildSectionSchemaRecursively(snippet.snippets, processedSnippets))
        }

        processedSnippets.push(snippet.name)
      }
    }

    return buildSchema
  }

  /**
   * Build Storefront Locales Or Schema Locales Recursively
   * @param {Snippet[]} snippets
   * @param {boolean} [isSchemaLocales=false]
   * @param {string[]} [processedSnippets=[]]
   * @return {Object}
   */
  static buildLocalesRecursively (snippets, isSchemaLocales = false, processedSnippets = []) {
    let buildLocales = {}
    const localesKey = isSchemaLocales ? 'schemaLocales' : 'locales'

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        if (snippet.build[localesKey]) {
          buildLocales = merge(buildLocales, snippet.build[localesKey])
        }

        // Recursively merge child Schema Locales
        if (snippet.snippets?.length) {
          buildLocales = merge(buildLocales, this.buildLocalesRecursively(snippet.snippets, isSchemaLocales, processedSnippets))
        }

        processedSnippets.push(snippet.name)
      }
    }

    return buildLocales
  }

  /**
   * Build Settings Schema Recursively
   * @param {Snippet[]} snippets
   * @param {string[]} [processedSnippets=[]]
   * @return {Object[]|null}
   */
  static buildSettingsSchemaRecursively (snippets, processedSnippets = []) {
    let settingsSchema = []

    for (const snippet of snippets) {
      if (!processedSnippets.includes(snippet.name)) {
        // Merge Snippet schema
        if (snippet.settingsSchema) {
          settingsSchema = mergeObjectArraysByUniqueKey(settingsSchema, snippet.settingsSchema)
        }

        // Recursively check child snippets for schema
        if (snippet.snippets?.length) {
          const childrenSettingsSchema = this.buildSettingsSchemaRecursively(snippet.snippets, processedSnippets)
          if (childrenSettingsSchema?.length) {
            settingsSchema = mergeObjectArraysByUniqueKey(settingsSchema, childrenSettingsSchema)
          }
        }

        processedSnippets.push(snippet.name)
      }
    }

    return settingsSchema.length ? settingsSchema : null
  }
}

export default SnippetUtils
