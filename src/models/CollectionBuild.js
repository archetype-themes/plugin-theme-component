import ComponentBuild from './ComponentBuild.js'

class CollectionBuild extends ComponentBuild {
  /** @type {string} **/
  configFolder

  /** @type {Object} **/
  locales

  /** @type {string} **/
  rootFolder

  /** @type {{entries: Map<string, string>, tags: Map<string,string>}} **/
  importMap

  /** @type {string} **/
  importMapFile

  /** @type {string} **/
  snippetsFolder

  /** @type {string} **/
  styles

  /** @type {string} **/
  stylesheet
}

export default CollectionBuild
