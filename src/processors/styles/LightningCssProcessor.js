import { bundle } from 'lightningcss'

class LightningCssProcessor {
  /**
   * Bundle CSS with LightningCSS
   * @param {string} sourceFile
   */
  static processStyles (sourceFile) {
    const { code, map } = bundle({
      filename: sourceFile,
      minify: false,
      sourceMap: true
    })

    return {
      code,
      map
    }
  }
}

export default LightningCssProcessor
