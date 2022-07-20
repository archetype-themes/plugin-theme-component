class Section {
  constructor () {
    this.cssFiles = []
    this.jsFiles = []
    this.jsModules = []
    this.liquidFiles = []
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

  get cssFiles () {
    return this._cssFiles
  }

  set cssFiles (cssFiles) {
    this._cssFiles = cssFiles
  }

  get jsFiles () {
    return this._jsFiles
  }

  set jsFiles (jsFiles) {
    this._jsFiles = jsFiles
  }

  get jsModules () {
    return this._jsModules
  }

  set jsModules (jsModules) {
    this._jsModules = jsModules
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

}

export default Section