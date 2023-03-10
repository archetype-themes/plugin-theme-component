import deepmerge from 'deepmerge'

class SectionSchemaUtils {
  static SECTION_SCHEMA_MERGEABLE_OBJECT_PROPERTIES = [
    'settings',
    'blocks',
    'presets',
    'default',
    'locales',
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
        sectionSchema[property] = deepmerge(originalSectionSchema[property], newSectionSchema[property])
      }
    }

    return sectionSchema
  }
}

export default SectionSchemaUtils
