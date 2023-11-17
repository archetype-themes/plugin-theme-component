class SyntaxUtils {
  static plural (array) {
    const length = array.length
    return length === 1 ? '' : 's'
  }

  static ucfirst (text) {
    const firstLetter = text.slice(0, 1)
    return firstLetter.toUpperCase() + text.substring(1)
  }
}

export default SyntaxUtils

export const plural = SyntaxUtils.plural
export const ucfirst = SyntaxUtils.ucfirst
