class Component {
  /** @type {string} **/
  name

  /** @type {string} **/
  rootFolder

  /** @type {ComponentFiles} **/
  files

  /** @type {ComponentBuild} **/
  build

  /** @type {string} **/
  liquidCode

  /** @type {Object} **/
  locales = {}

  /** @type {string[]} **/
  snippetNames

  /** @type {Snippet[]} **/
  snippets = []

  /**
   * Constructor
   * @param {string} [name] - Component Name
   * @param {string} [path] - Component Path
   */
  constructor(name, path) {
    if (name) this.name = name
    if (path) this.rootFolder = path
  }

  isSvg() {
    return !!(
      this.name.startsWith('icon-') ||
      this.name.endsWith('-svg') ||
      this.name.endsWith('.svg')
    )
  }
}

export default Component
