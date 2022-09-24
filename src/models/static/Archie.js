import Config from './Config.js'

class Archie {

  // Build Command
  static BUILD_COMMAND = 'build'
  static BUILD_COMMAND_ALLOWED_COMPONENTS = [Config.SECTION_COMPONENT_TYPE, Config.COLLECTION_COMPONENT_TYPE]
  static BUILD_COMMAND_OPTIONS = [Config.COLLECTION_COMPONENT_TYPE, Config.SECTION_COMPONENT_TYPE]

  // Create Command
  static CREATE_COMMAND = 'create'
  static CREATE_COMMAND_ALLOWED_COMPONENTS = [Config.COLLECTION_COMPONENT_TYPE]
  static CREATE_COMMAND_OPTIONS = [Config.SECTION_COMPONENT_TYPE, Config.SNIPPET_COMPONENT_TYPE]

  // Install Command
  static INSTALL_COMMAND = 'install'
  static INSTALL_COMMAND_ALLOWED_COMPONENTS = [Config.THEME_COMPONENT_TYPE]

  // Watch Command
  static WATCH_COMMAND = 'watch'
  static WATCH_COMMAND_ALLOWED_COMPONENTS = this.BUILD_COMMAND_ALLOWED_COMPONENTS
  static WATCH_COMMAND_OPTIONS = this.BUILD_COMMAND_OPTIONS

  static AVAILABLE_COMMANDS = [this.BUILD_COMMAND, this.CREATE_COMMAND, this.INSTALL_COMMAND, this.WATCH_COMMAND]

  /** @type {string}  **/
  static #command

  /** @type {string}  **/
  static #commandOption

  /** @type {string}  **/
  static #targetComponent

  static get command () {
    return this.#command
  }

  static set command (value) {
    this.#command = value
  }

  static get commandOption () {
    return this.#commandOption
  }

  static set commandOption (value) {
    this.#commandOption = value
  }

  static get targetComponent () {
    return this.#targetComponent
  }

  static set targetComponent (value) {
    this.#targetComponent = value
  }
}

export default Archie
