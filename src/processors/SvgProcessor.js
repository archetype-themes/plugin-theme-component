import { JSDOM } from 'jsdom'
import { loadConfig, optimize } from 'svgo'
import logger from '../utils/Logger.js'

class SvgProcessor {
  /** @type {Object} **/
  static #svgoConfig
  /** @type {boolean} **/
  static #svgoConfigCheck = false

  /**
   * Build SVG
   * @param {string} svgName
   * @param {string} svgSource
   * @param {string} cwd
   * @return {Promise<string>}
   */
  static async buildSvg (svgName, svgSource, cwd) {
    // SVGO processing
    if (!this.#svgoConfigCheck) {
      this.#svgoConfig = await loadConfig(null, cwd)
      if (!this.#svgoConfig) {
        logger.warn('SVGO configuration not found. Proceeding with default settings.')
      }
      this.#svgoConfigCheck = true
    }

    const result = optimize(svgSource, this.#svgoConfig)

    // JSDOM additional manipulations
    const dom = new JSDOM(result.data)
    const svg = dom.window.document.querySelector('svg')

    if (svg) {
      const newSvg = dom.window.document.createElement('svg')

      newSvg.setAttribute('aria-hidden', 'true')
      newSvg.setAttribute('focusable', 'false')
      newSvg.setAttribute('role', 'presentation')
      newSvg.classList.add('icon')

      const fileName = svgName.replace('.svg', '')
      const viewBoxAttr = svg.getAttribute('viewBox')

      // Add the necessary attributes
      if (viewBoxAttr) {
        const width = parseInt(viewBoxAttr.split(' ')[2], 10)
        const height = parseInt(viewBoxAttr.split(' ')[3], 10)
        const widthToHeightRatio = width / height
        if (widthToHeightRatio >= 1.5) {
          newSvg.classList.add('icon--wide')
        }
        newSvg.setAttribute('viewBox', viewBoxAttr)
      }

      // Add required classes to full color icons
      if (fileName.includes('-full-color')) {
        newSvg.classList.add('icon--full-color')
      }

      newSvg.classList.add(fileName)
      while (svg.firstChild) {
        newSvg.appendChild(svg.firstChild)
      }
      svg.parentNode.replaceChild(newSvg, svg)
      return newSvg.outerHTML
    }
    logger.warn(`No SVG found inside "${svgName}". Source code will be returned as is.`)
    return svgSource
  }
}

export default SvgProcessor
