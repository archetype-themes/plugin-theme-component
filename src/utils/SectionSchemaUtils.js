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
}

export default SectionSchemaUtils
