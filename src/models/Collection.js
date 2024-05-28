/** @module models/Collection */
class Collection {
  /** @type {CollectionBuild} **/
  build

  /** @type {string} **/
  name

  /** @type {string} **/
  copyright

  /** @type {string} **/
  rootFolder

  /** @type {string} **/
  source

  /** @type {Component[]} **/
  components

  /** @type {string | undefined} **/
  gitIgnoreFile

  /** @type {Set<string>|null} **/
  componentNames

  /** @type {Snippet[]} **/
  snippets

  /** @type {Map<string, string> | undefined} **/
  importMapEntries

  /**
   * Get all components and snippets in a single array
   * @return {(Component|Snippet)[]}
   */
  get allComponents() {
    return [...this.components, ...this.snippets]
  }

  /**
   * Retrieves asset files from an array of Component or Snippet objects.
   * @return {string[]} - An array of asset files.
   */
  get assetFiles() {
    return this.components
      .filter((component) => component.files.assetFiles?.length)
      .flatMap((component) => component.files.assetFiles)
  }

  /**
   * Get Javascript Files From All Components
   * @return {string[]}
   */
  get jsFiles() {
    return this.components
      .filter((component) => component.files.javascriptFiles)
      .map((component) => component.files.javascriptFiles)
      .flat()
  }

  /**
   * Get JavaScript Indexes From All Components
   * @return {string[]}
   */
  get jsIndexes() {
    return this.components
      .filter((component) => component.files.javascriptIndex)
      .map((component) => component.files.javascriptIndex)
  }

  /**
   * Get Liquid Code From All Components
   * @return {string[]}
   */
  get liquidCode() {
    return this.allComponents.map((component) => component.liquidCode)
  }

  /**
   * Get Main Stylesheets From All Components
   * @return {string[]}
   */
  get mainStylesheets() {
    return this.components
      .filter((component) => component.files.mainStylesheet)
      .map((component) => component.files.mainStylesheet)
  }
}

export default Collection
