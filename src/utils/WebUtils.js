import https from 'node:https'
import { join, basename } from 'node:path'
import FileUtils from './FileUtils.js'

const URL_REGEX = /^(http:\/\/|https:\/\/|\/\/)/

/**
 * Download a list of files to a target folder
 * @param {string[]} remoteFiles
 * @param {string} targetFolder
 * @return {Promise<Awaited<void>[]>}
 */
export async function downloadFiles(remoteFiles, targetFolder) {
  const downloadPromises = remoteFiles.map((file) => downloadFile(file, targetFolder))

  return Promise.all(downloadPromises)
}

/**
 * Download a file to a target folder
 * @param {string} remoteFile
 * @param {string} targetFolder
 * @return {Promise<void>}
 */
export async function downloadFile(remoteFile, targetFolder) {
  return new Promise((resolve, reject) => {
    https
      .get(remoteFile, (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          resolve(FileUtils.saveFile(join(targetFolder, basename(remoteFile)), data))
        })
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

/**
 * Get URL
 * @param {string} url
 * @return {Promise<string>}
 */
export async function getUrl(url) {
  try {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = ''

          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            resolve(data)
          })
        })
        .on('error', (err) => {
          reject(err)
        })
    })
  } catch (error) {
    throw new Error(`Unable to get URL: ${url}\n Error Received: ${error}`)
  }
}

/**
 * Check if a string is a URL
 * @param {string} possibleUrl
 */
export function isUrl(possibleUrl) {
  return URL_REGEX.test(possibleUrl)
}
