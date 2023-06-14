import SectionBuild from '../models/SectionBuild.js'
import CollectionBuild from '../models/CollectionBuild.js'

class BuildFactory {
  static fromCollection (collection) {
    const build = new CollectionBuild()
    build.rootFolder = `${collection.rootFolder}/build`
    build.assetsFolder = `${build.rootFolder}/assets`
    build.configFolder = `${build.rootFolder}/config`
    build.localesFolder = `${build.rootFolder}/locales`
    build.sectionsFolder = `${build.rootFolder}/sections`
    build.snippetsFolder = `${build.rootFolder}/snippets`

    build.javascriptFile = `${build.assetsFolder}/${collection.name}.js`
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
    build.assetsFolder = `${build.rootFolder}/assets`
    build.configFolder = `${build.rootFolder}/config`
    build.localesFolder = `${build.rootFolder}/locales`
    build.snippetsFolder = `${build.rootFolder}/snippets`

    build.liquidFile = `${build.rootFolder}/${section.name}.liquid`
    build.javascriptFile = `${build.assetsFolder}/${section.name}.js`
    build.stylesheet = `${build.assetsFolder}/${section.name}.css.liquid`
    build.stylesBundleFile = `${build.assetsFolder}/${section.name}.bundle.css`
    return build
  }
}

export default BuildFactory
