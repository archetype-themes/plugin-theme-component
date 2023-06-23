import Components from '../../config/Components.js'
import SectionBuild from '../models/SectionBuild.js'
import CollectionBuild from '../models/CollectionBuild.js'

class BuildFactory {
  static fromCollection (collection) {
    const build = new CollectionBuild()
    build.rootFolder = `${collection.rootFolder}/build`
    build.assetsFolder = `${build.rootFolder}/${Components.THEME_ASSETS_FOLDER}`
    build.configFolder = `${build.rootFolder}/${Components.THEME_CONFIG_FOLDER}`
    build.localesFolder = `${build.rootFolder}/${Components.THEME_LOCALES_FOLDER}`
    build.sectionsFolder = `${build.rootFolder}/${Components.THEME_SECTIONS_FOLDER}`
    build.snippetsFolder = `${build.rootFolder}/${Components.THEME_SNIPPETS_FOLDER}`

    build.javascriptFile = `${build.assetsFolder}/${collection.name}.js`
    build.settingsSchemaFile = `${build.configFolder}/${Components.THEME_SETTINGS_SCHEMA_FILENAME}`
    build.stylesheet = `${build.assetsFolder}/${collection.name}.css.liquid`

    return build
  }

  /**
   *
   * @param section
   * @returns {SectionBuild}
   */
  static fromSection (section) {
    const build = new SectionBuild()
    build.rootFolder = `${section.rootFolder}/build`
    build.assetsFolder = `${build.rootFolder}/${Components.THEME_ASSETS_FOLDER}`
    build.configFolder = `${build.rootFolder}/${Components.THEME_CONFIG_FOLDER}`
    build.localesFolder = `${build.rootFolder}/${Components.THEME_LOCALES_FOLDER}`
    build.snippetsFolder = `${build.rootFolder}/${Components.THEME_SNIPPETS_FOLDER}`

    build.liquidFile = `${build.rootFolder}/${section.name}.liquid`
    build.javascriptFile = `${build.assetsFolder}/${section.name}.js`
    build.settingsSchemaFile = `${build.configFolder}/${Components.THEME_SETTINGS_SCHEMA_FILENAME}`
    build.stylesheet = `${build.assetsFolder}/${section.name}.css.liquid`

    return build
  }
}

export default BuildFactory
