import Session from '../models/static/Session.js'

/**
 *
 * @param {string} commandId
 * @param {ComponentTomlConfig} tomlConfig
 */
export function sessionFactory(commandId, tomlConfig) {
  Session.config = tomlConfig

  return Session
}
