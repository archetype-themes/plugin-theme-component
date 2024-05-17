// External Dependencies
import { join, basename } from 'node:path'
import { ux } from '@oclif/core'

// Internal Dependencies
import { saveFile } from './FileUtils.js'

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
  const response = await fetch(remoteFile)

  if (!response.ok) {
    throw new Error(
      `Unable to download file "${remoteFile}"\n Received HTTP Error Code:${response.status} - ${response.statusText}`
    )
  }

  const data = await response.text()
  await saveFile(join(targetFolder, basename(remoteFile)), data)
}

/**
 * Add HTTP Basic Auth to URL
 * @param {string} urlString
 * @param {string} username
 * @param {string} password
 * @return {string}
 */
export function addAuthToUrl(urlString, username, password) {
  try {
    const parsedUrl = new URL(urlString)

    // Ajouter les informations d'authentification à l'URL
    parsedUrl.username = username
    parsedUrl.password = password

    return parsedUrl.toString()
  } catch (error) {
    throw new Error(`WebUtils:addAuthToUrl => Unable to parse URL \n\tURL: "${urlString}"\n\tError: ${error}`)
  }
}

/**
 * Test to see if the URL provided has http basic auth credentials in it
 * @param {string} url
 * @return {boolean}
 */
export function hasAuthInUrl(url) {
  try {
    const parsedUrl = new URL(url)
    return Boolean(parsedUrl.username && parsedUrl.password)
  } catch (error) {
    ux.debug(`Error checking the following URL for HTTP Basic Auth Parameters: ${url}\n ${error}`)
    return false
  }
}

/**
 * Check if a string is a URL
 * @param {string} possibleUrl
 */
export function isUrl(possibleUrl) {
  return URL_REGEX.test(possibleUrl)
}
