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
}

export default Collection
