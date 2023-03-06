// NodeJS Imports
import { mkdir } from 'node:fs/promises'

// External Modules imports
// Internal Modules

class ComponentUtils {
  /**
   *
   * @param {Section|Snippet} component
   * @return {Promise<void>}
   */
  static async createFolderStructure (component) {
    await mkdir(`${component.rootFolder}/src/locales`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/scripts`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/styles`, { recursive: true })
    await mkdir(`${component.rootFolder}/src/snippets`, { recursive: true })
  }
}

export default ComponentUtils
