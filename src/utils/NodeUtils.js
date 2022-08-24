import { env } from 'node:process'
import FileUtils from './FileUtils.js'

class NodeUtils {
  static #packageJson

  static getArgs () {
    const args = process.argv.slice(2)
    const filteredArgs = []

    for (const arg of args) {
      if (!arg.match(/^--(verbose|quiet|debug)$/i)) {
        filteredArgs.push(arg)
      }
    }

    return filteredArgs
  }

  static async getPackageJson () {
    if (!env.PROJECT_CWD) {
      throw new Error(`Environment variable "PROJECT_CWD" is not available. Please make sure to use this command with a recent version of yarn.`)
    }

    if (!this.#packageJson) {
      this.#packageJson = JSON.parse(await FileUtils.getFileContents(`${env.PROJECT_CWD}/package.json`))
    }
    return this.#packageJson
  }
}

export default NodeUtils
