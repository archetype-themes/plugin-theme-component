import SvgProcessor from '../processors/SvgProcessor.js'

class SnippetBuilder {
  static async buildLiquid (snippetName, snippetLiquidCode) {
    if (snippetName.startsWith('icon-') || snippetName.endsWith('-svg') || snippetName.endsWith('.svg')) {
      console.log('BEFORE', snippetLiquidCode)
      return SvgProcessor.buildSvg(snippetName, snippetLiquidCode)
    }
    return snippetLiquidCode
  }
}

export default SnippetBuilder
