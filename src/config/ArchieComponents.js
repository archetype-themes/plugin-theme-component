class ArchieComponents {
  // Collection Sub-Folders
  static COLLECTION_ASSETS_SUB_FOLDER = 'assets'
  static COLLECTION_SECTIONS_SUB_FOLDER = 'sections'
  static COLLECTION_SNIPPETS_SUB_FOLDER = 'snippets'
  // Component Types
  static COLLECTION_COMPONENT_TYPE = 'collection'
  static SECTION_COMPONENT_TYPE = 'section'
  static SNIPPET_COMPONENT_TYPE = 'snippet'
  static THEME_COMPONENT_TYPE = 'theme'

  // Default Package Scope for all Components
  static DEFAULT_PACKAGE_SCOPE = '@archetype-themes'

  // Allowed Component Types in package.json file under archie.collections
  static NODE_CONFIG_ALLOWED_COMPONENT_TYPES = [
    this.COLLECTION_COMPONENT_TYPE,
    this.SECTION_COMPONENT_TYPE,
    this.SNIPPET_COMPONENT_TYPE,
    this.THEME_COMPONENT_TYPE]

}

export default ArchieComponents
