// Internal Modules
import CLISession from '../models/CLISession.js'
import NodeConfig from '../models/NodeConfig.js'

class NodeConfigFactory {
  /**
   * Init Archie Config
   * @param {Object} packageManifest
   * @return {void}
   */
  static fromPackageManifest (packageManifest) {
    // Load Component Path, if available
    if (packageManifest.archie?.componentPath) {
      NodeConfig.componentPath = packageManifest.archie.componentPath
    }

    if (packageManifest.archie?.embedLocales) {
      NodeConfig.embedLocales = packageManifest.archie.embedLocales
    }

    if (CLISession.isTheme()) {
      NodeConfig.collections = this.#findCollections(packageManifest)
    }
  }

  /**
   * Get Component Type
   * @param {Object} packageManifest
   * @return {string[]}
   */
  static #findCollections (packageManifest) {
    /** @var {archie} packageJson.archie **/
    return packageManifest.archie?.collections ? packageManifest.archie.collections : []
  }
}

export default NodeConfigFactory
