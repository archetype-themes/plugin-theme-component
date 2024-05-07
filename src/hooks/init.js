import { input } from '@inquirer/prompts'

import { getCLIRootFolderName } from '../utils/NodeUtils.js'
import { exists, saveFile } from '../utils/FileUtils.js'
import { join } from 'node:path'
import User from '../models/User.js'

/**
 * DevKit CLI Email Registration Prompt
 * @return {Promise<void>}
 */
export default async function () {
  const userInfoSaveFile = join(getCLIRootFolderName(), 'user-info.json')

  if (!(await exists(userInfoSaveFile))) {
    const user = new User()

    console.log('\n---------------------------------------------------------------')
    console.log('Thanks for downloading the Archetype Themes’ Component plugin.')
    console.log(
      'To be the first in line to know about new DevKit releases and \n' +
        'upcoming features, we highly recommend that you subscribe\n' +
        'to our DevKit newsletter, or leave the field empty to opt-out.'
    )
    console.log('---------------------------------------------------------------')
    user.email = await input({ message: 'Enter your email' })

    if (user.email) {
      const userName = await input({ message: 'Enter your name' })
      if (userName.indexOf(' ') === -1) {
        user.first_name = userName
      } else {
        const userNameArray = userName.split(/ (.*)/)
        user.first_name = userNameArray[0]
        user.last_name = userNameArray[1]
      }
    }
    user.tags = 'Devkit, Devkit CLI'
    await saveFile(join(getCLIRootFolderName(), 'user-info.json'), JSON.stringify(user, null, 2) + '\n')
    if (user.email) {
      console.log(await apiNewsletterAdd(user))
    } else {
      console.log('Should you change your mind, you can always subscribe later at\nhttps://dev.archetypethemes.co')
    }
    console.log('---------------------------------------------------------------\n')
  }
}

/**
 * Submit User Info
 * @param {User} user
 * @return {Promise<string>}
 */
async function apiNewsletterAdd(user) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  }

  try {
    const response = await fetch(`https://api.archetypethemes.co/api/newsletter/add`, options)

    // Handle error state
    if (response.ok || response.status === 422) {
      return `Success! Check your email to confirm subscription.`
    } else if ([409, 405].includes(response.status)) {
      return `You're already subscribed to this list`
    } else {
      return `Error ${response.status}: ${response.statusText}`
    }
  } catch (e) {
    return `There was an error while trying to submit your email`
  }
}
