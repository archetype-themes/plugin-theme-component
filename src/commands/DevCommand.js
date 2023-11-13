import Components from '../config/Components.js'

export const DEV_COMMAND_NAME = 'dev'

/** @type {string[]} **/
export const DEV_COMMAND_AVAILABLE_CALLER_TYPES = [Components.COLLECTION_TYPE_NAME]
/** @type {string[]} **/
export const DEV_COMMAND_AVAILABLE_TARGET_TYPES = [Components.COMPONENT_TYPE_NAME]

class DevCommand {
  static async execute () {

  }
}

export default DevCommand
