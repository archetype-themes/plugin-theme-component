// Internal imports
import SectionSchema from '../models/SectionSchema.js'
import SectionSchemaUtils from './SectionSchemaUtils.js'

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
}

export default SnippetUtils
