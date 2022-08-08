class Section {
  constructor () {
    this.styleSheets = []
    this.jsFiles = []
    this.jsModules = []
    this.liquidFiles = []
    this.localeFiles = []
  }

  get name () {
    return this._name
  }

  set name (name) {
    this._name = name
  }

  get rootFolder () {
    return this._rootFolder
  }

  set rootFolder (rootFolder) {
    this._rootFolder = rootFolder
  }

  get buildFolder () {
    return this._buildFolder
  }

  set buildFolder (assetsBuildFolder) {
    this._buildFolder = assetsBuildFolder
  }

  get assetsBuildFolder () {
    return this._assetsBuildFolder
  }

  set assetsBuildFolder (assetsBuildFolder) {
    this._assetsBuildFolder = assetsBuildFolder
  }

  get localesBuildFolder () {
    return this._localesBuildFolder
  }

  set localesBuildFolder (localesBuildFolder) {
    this._localesBuildFolder = localesBuildFolder
  }

  get styleSheets () {
    return this._styleSheets
  }

  set styleSheets (styleSheets) {
    this._styleSheets = styleSheets
  }

  get jsFiles () {
    return this._jsFiles
  }

  set jsFiles (jsFiles) {
    this._jsFiles = jsFiles
  }

  get liquidFiles () {
    return this._liquidFiles
  }

  set liquidFiles (liquidFiles) {
    this._liquidFiles = liquidFiles
  }

  get schemaFile () {
    return this._schemaFile
  }

  set schemaFile (schemaFile) {
    this._schemaFile = schemaFile
  }

  get localeFiles () {
    return this._localeFiles
  }

  set localeFiles (localeFiles) {
    this._localeFiles = localeFiles
  }
}

export default Section