/**
 * Get Current Time in a 24h string format
 * @returns {string}
 */
export function getCurrentTime() {
  const dateISOString = new Date().toISOString()
  const tPos = dateISOString.indexOf('T')
  return dateISOString.substring(tPos + 1, tPos + 9)
}
