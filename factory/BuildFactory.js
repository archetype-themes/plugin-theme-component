import SectionBuild from '../models/SectionBuild.js'
import SnippetBuild from '../models/SnippetBuild.js'

class BuildFactory {
  /**
   *
   * @param section
   * @returns {SectionBuild}
   */
  static fromSection (section) {
    const build = new SectionBuild()
    build.rootFolder = `${section.rootFolder}/build`
    build.assetsFolder = `${build.rootFolder}/assets`
    build.localesFolder = `${build.rootFolder}/locales`
    build.snippetsFolder = `${build.rootFolder}/snippets`

    build.liquidFile = `${build.rootFolder}/${section.name}.liquid`
    build.javascriptFile = `${build.assetsFolder}/${section.name}.js`
    build.stylesheet = `${build.assetsFolder}/${section.name}.css`
    return build
  }

  /**
   *
   * @param {Snippet} snippet
   * @returns {SnippetBuild}
   */
  static fromSnippet (snippet) {
    const build = new SnippetBuild()
    build.rootFolder = `${snippet.rootFolder}/build`
    build.assetsFolder = `${build.rootFolder}/assets`
    build.localesFolder = `${build.rootFolder}/locales`

    build.liquidFile = `${build.rootFolder}/${snippet.name}.liquid`
    build.javascriptFile = `${build.assetsFolder}/${snippet.name}.js`
    build.stylesheet = `${build.assetsFolder}/${snippet.name}.css`
    return build
  }

}

export default BuildFactory