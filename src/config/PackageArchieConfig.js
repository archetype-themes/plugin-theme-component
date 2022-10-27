import ComponentsConfig from './ComponentsConfig.js'

class PackageArchieConfig {
  static ALLOWED_COMPONENT_TYPES = [
    ComponentsConfig.COLLECTION_COMPONENT_TYPE,
    ComponentsConfig.SECTION_COMPONENT_TYPE,
    ComponentsConfig.SNIPPET_COMPONENT_TYPE,
    ComponentsConfig.THEME_COMPONENT_TYPE]
}

export default PackageArchieConfig
