import RenderFactory from '../factory/RenderFactory.js'

class LiquidUtils {

  static findRenders (liquidCode) {
    const regex = /\{%\s+render\s+'(?<snippet>[\p{L}_. -]+)'(?:\s*(?<clause>for|with)\s+(?<clauseSourceVariable>\w+[.\w]+)\s+as\s+(?<clauseTargetVariable>\w+))?(?<variables>(?:\s*,\s*\w+:\s*'?\w+'?)*)\s+%\}/giu

    const matches = [...liquidCode.matchAll(regex)]
    const renders = []

    for (const match of matches) {
      console.log(match)
      renders.push(RenderFactory.fromMatch(match[0], match.groups))
    }

    return renders
  }

  static findSections () {
    let match
    const regex = /<script.*?src="(.*?)"/gmi
    const sections = []
    while (match = regex.exec(html)) {
      sections.push(match[1])
    }
    return sections
  }
}

export default LiquidUtils