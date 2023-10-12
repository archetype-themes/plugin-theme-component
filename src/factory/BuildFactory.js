import CollectionBuild from '../models/CollectionBuild.js'
import Components from '../config/Components.js'

class BuildFactory {
  static fromCollection (collection) {
    const build = new CollectionBuild()
    build.rootFolder = `${collection.rootFolder}/build`
    build.assetsFolder = `${build.rootFolder}/${Components.ASSETS_FOLDER_NAME}`
    build.configFolder = `${build.rootFolder}/${Components.CONFIG_FOLDER_NAME}`
    build.localesFolder = `${build.rootFolder}/${Components.LOCALES_FOLDER_NAME}`
    build.sectionsFolder = `${build.rootFolder}/${Components.SECTIONS_FOLDER_NAME}`
    build.snippetsFolder = `${build.rootFolder}/${Components.SNIPPETS_FOLDER_NAME}`

    build.javascriptFile = `${build.assetsFolder}/${collection.name}.js`
    build.settingsSchemaFile = `${build.configFolder}/${Components.SETTINGS_SCHEMA_FILENAME}`
    build.stylesheet = `${build.assetsFolder}/${collection.name}.css.liquid`

    return build
  }
}

export default BuildFactory
