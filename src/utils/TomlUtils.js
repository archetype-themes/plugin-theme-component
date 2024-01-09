import * as toml from '@iarna/toml'

/**
 * Given a TOML string, it returns a JSON object.
 *
 * @param {string} input
 */
export function decodeToml (input) {
  const normalizedInput = input.replace(/\r\n$/g, '\n')
  return toml.parse(normalizedInput)
}
