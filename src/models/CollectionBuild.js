import ComponentBuild from './ComponentBuild.js'

class CollectionBuild extends ComponentBuild {
  /** @type {Object} **/
  locales

  /** @type {{entries: Map<string, string>, tags:string}} **/
  importMap

  /** @type {string} **/
  styles

  /** @type {string} **/
  stylesheet
}

export default CollectionBuild
