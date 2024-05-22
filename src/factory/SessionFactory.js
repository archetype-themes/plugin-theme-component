import Session from '../models/static/Session.js'

/**
 * Session Factory
 * @param {ComponentTomlConfig} tomlConfig
 */
export function sessionFactory(tomlConfig) {
  Session.config = tomlConfig

  return Session
}
