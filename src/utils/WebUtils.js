import https from 'node:https'
import { join, basename } from 'node:path'
import FileUtils from './FileUtils.js'

const URL_REGEX = /^(http:\/\/|https:\/\/|\/\/)/

class WebUtils {
  /**
   * @param {string[]} remoteFiles
   * @param {string} targetFolder
   */
  static async downloadFiles (remoteFiles, targetFolder) {
    const downloadPromises = remoteFiles.map(file => this.downloadFile(file, targetFolder))

    return Promise.all(downloadPromises)
  }

  /**
   * @param {string} remoteFile
   * @param {string} targetFolder
   */
  static async downloadFile (remoteFile, targetFolder) {
    return new Promise((resolve, reject) => {
      https.get(remoteFile, (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          resolve(FileUtils.writeFile(join(targetFolder, basename(remoteFile)), data))
        })
      }).on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * @param {string} possibleUrl
   */
  static isUrl (possibleUrl) {
    return URL_REGEX.test(possibleUrl)
  }
}

export default WebUtils
