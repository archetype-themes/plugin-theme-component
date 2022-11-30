import sass from 'sass'

class SassPreProcessor {

  /**
   * Process Stylesheet with SASS CSS Preprocessor
   * @param {string} stylesheet
   * @return {string | Buffer}
   */
  static processStyleSheet (stylesheet) {
    const result = sass.compile(stylesheet)
    return result.css
  }
}

export default SassPreProcessor
