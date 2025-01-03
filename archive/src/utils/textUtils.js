import InternalError from '../errors/InternalError.js'

/**
 * Return plural 's' based on the collection length
 * @param {Array|Set} collection
 * @returns {string}
 */
export function plural(collection) {
  let length

  if (Array.isArray(collection)) {
    length = collection.length
  } else if (collection instanceof Set || collection instanceof Map) {
    length = collection.size
  } else {
    throw new InternalError('plural expected a variable of type array/map/set, but received something else')
  }

  return length === 1 ? '' : 's'
}

/**
 * Change the First Letter Of A String To Uppercase
 * @param {string} text
 * @returns {string}
 */
export function ucFirst(text) {
  const firstLetter = text.slice(0, 1)
  return firstLetter.toUpperCase() + text.substring(1)
}
