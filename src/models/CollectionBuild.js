import ComponentBuild from './ComponentBuild.js'

class CollectionBuild extends ComponentBuild {
  /** @type {string} **/
  assetsFolder

  /** @type {string} **/
  configFolder

  /** @type {string} **/
  javascriptFile

  /** @type {Object} **/
  locales

  /** @type {string} **/
  localesFolder

  /** @type {string} **/
  rootFolder

  /** @type {string} **/
  sectionsFolder

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
