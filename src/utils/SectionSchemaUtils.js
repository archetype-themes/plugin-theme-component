import merge from 'deepmerge'

class SectionSchemaUtils {
  static SECTION_SCHEMA_MERGEABLE_OBJECT_PROPERTIES = [
    'settings',
    'blocks',
    'presets',
    'default',
    'templates'
  ]

  /**
   * Deep Merge SectionSchema instances
   * This method is necessary because all properties are private
   * @param originalSectionSchema
   * @param newSectionSchema
   * @return {SectionSchema}
   */
  static merge (originalSectionSchema, newSectionSchema) {
    const sectionSchema = originalSectionSchema

    for (const property of this.SECTION_SCHEMA_MERGEABLE_OBJECT_PROPERTIES) {
      if (newSectionSchema[property]) {
        sectionSchema[property] = merge(originalSectionSchema[property], newSectionSchema[property])
      }
    }

    return sectionSchema
  }

  /**
   * Build Section Schema
   * @param {SectionSchema} schema
   * @param {SectionSchema} [snippetsSchema]
   * @returns {SectionSchema}
   */
  static build (schema, snippetsSchema) {
    let buildSchema

    if (snippetsSchema) {
      buildSchema = this.merge(schema, snippetsSchema)
    } else {
      buildSchema = schema
    }

    if (buildSchema.locales) {
      delete buildSchema.locales
    }

    return buildSchema
  }
}

export default SectionSchemaUtils
