export function plural (array) {
  const length = array.length
  return length === 1 ? '' : 's'
}

export function ucFirst (text) {
  const firstLetter = text.slice(0, 1)
  return firstLetter.toUpperCase() + text.substring(1)
}

export default { plural, ucFirst }
