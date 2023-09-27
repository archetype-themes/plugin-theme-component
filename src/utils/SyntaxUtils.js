class SyntaxUtils {
  static plural (array) {
    const length = array.length
    return length === 1 ? '' : 's'
  }
}

export default SyntaxUtils
export const plural = SyntaxUtils.plural
