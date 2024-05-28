import { getPackageName } from './NodeUtils.js'
import InternalError from '../errors/InternalError.js'
import { FileTypes } from '../config/constants.js'

/**
 * Get Component File Copyright
 * @param {string} fileType
 * @param {string} copyright
 **/
export function getCopyright(fileType, copyright) {
  if (fileType === FileTypes.Liquid) {
    copyright = `{% # ${copyright}  %}\n`
  } else if ([FileTypes.Javascript, FileTypes.Css].includes(fileType)) {
    copyright = `/* ${copyright} */\n`
  } else if (fileType === FileTypes.Svg) {
    copyright = `<!-- ${copyright} -->/\n`
  } else {
    throw new InternalError(`Unknown File Type Received ${fileType}. Couldn't render copyright text`)
  }
  return copyright
}

/**
 * Build Copyright Text From Package Manifest Data
 * @param {Object} packageManifest
 * @return {string} Copyright Text
 */
export function getCopyrightText(packageManifest) {
  let copyrightText = ''

  copyrightText += getPackageName(packageManifest)
  if (packageManifest.version) {
    copyrightText += ` v${packageManifest.version}`
  }

  copyrightText += ` | Copyright © ${new Date().getFullYear()}`

  if (packageManifest.author) {
    copyrightText += ` ${packageManifest.author} `
  }

  copyrightText += packageManifest.license ? ` | "${packageManifest.license}" License` : ' | All Rights Reserved'

  return copyrightText
}
