class Snippet {
  constructor () {
    this.styleSheets = []
    this.jsFiles = []
    this.liquidFiles = []
    this.localeFiles = []
  }

  /**
   * Get Name
   * @returns {string}
   */
  get name () {
    return this._name
  }

  /**
   * Set Name
   * @param {string} name
   */
  set name (name) {
    this._name = name
  }

  /**
   * Get Root Folder
   * @returns {string}
   */
  get rootFolder () {
    return this._rootFolder
  }

  /**
   * Set Root Folder
   * @param {string} rootFolder
   */
  set rootFolder (rootFolder) {
    this._rootFolder = rootFolder
  }

  /**
   * Get Build Folder
   * @returns {string}
   */
  get buildFolder () {
    return this._buildFolder
  }

  /**
   * Set Build Folder
   * @param {string} buildFolder
   */
  set buildFolder (buildFolder) {
    this._buildFolder = buildFolder
  }

  /**
   * Get Assets Build Folder
   * @returns {string}
   */
  get assetsBuildFolder () {
    return this._assetsBuildFolder
  }

  /**
   * Set Assets Build Folder
   * @param {string} assetsBuildFolder
   */
  set assetsBuildFolder (assetsBuildFolder) {
    this._assetsBuildFolder = assetsBuildFolder
  }

  /**
   * Get Locales Build Folder
   * @returns {string}
   */
  get localesBuildFolder () {
    return this._localesBuildFolder
  }

  /**
   * Set Locales Build Folder
   * @param {string} localesBuildFolder
   */
  set localesBuildFolder (localesBuildFolder) {
    this._localesBuildFolder = localesBuildFolder
  }

  /**
   * Get StyleSheets Files
   * @returns {string[]}
   */
  get styleSheets () {
    return this._styleSheets
  }

  /**
   * Set StyleSheet Files
   * @param {string[]} styleSheets
   */
  set styleSheets (styleSheets) {
    this._styleSheets = styleSheets
  }

  /**
   * Get JavaScript Files
   * @returns {string[]}
   */
  get jsFiles () {
    return this._jsFiles
  }

  /**
   * Set JavaScript Files
   * @param {string[]} jsFiles
   */
  set jsFiles (jsFiles) {
    this._jsFiles = jsFiles
  }

  /**
   * Get Liquid Code
   * @returns {string}
   */
  get liquidCode () {
    return this._liquidCode
  }

  /**
   * Set Liquid Code
   * @param {string} liquidCode
   */
  set liquidCode (liquidCode) {
    this._liquidCode = liquidCode
  }

  /**
   * Get Liquid Files
   * @returns {string[]}
   */
  get liquidFiles () {
    return this._liquidFiles
  }

  /**
   *  Set Liquid Files
   * @param {string[]} liquidFiles
   */
  set liquidFiles (liquidFiles) {
    this._liquidFiles = liquidFiles
  }

  /**
   * Get Locale Files
   * @returns {string[]}
   */
  get localeFiles () {
    return this._localeFiles
  }

  /**
   * Set Locale Files
   * @param {string[]} localeFiles
   */
  set localeFiles (localeFiles) {
    this._localeFiles = localeFiles
  }
}

export default Snippet