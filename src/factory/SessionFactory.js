import Session from '../models/static/Session.js'

/**
 *
 * @param {string} commandId
 * @param {ComponentTomlConfig} tomlConfig
 */
export function sessionFactory(commandId, tomlConfig) {
  const commandElements = commandId.split(':')

  Session.config = tomlConfig
  Session.command = commandElements[commandElements.length - 1]

  return Session
}
