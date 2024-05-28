// External Dependencies
import { chdir, cwd, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'

// Internal Dependencies
import { install } from '../../../../src/utils/externalComponents.js'
import { config } from 'dotenv'
import { resolve } from 'node:path'
import { exists, saveFile } from '../../../../src/utils/fileUtils.js'

// Load .env test file
config({ path: ['.env.test.local', '.env.test'] })

const workingDirectory = cwd()

describe('Generate Command File', async function () {
  before(async function () {
    this.timeout(30000)
    const userDataFile = resolve(workingDirectory, 'user-info.json')
    if (!(await exists(userDataFile))) {
      await saveFile(resolve(workingDirectory, 'user-info.json'), '')
    }
    const componentsRepoUrl = env.COMPONENTS_REPO
      ? env.COMPONENTS_REPO
      : 'https://github.com/archetype-themes/reference-components.git'
    const componentsInstallPath = await install(componentsRepoUrl)
    chdir(componentsInstallPath)
  })

  test
    .timeout(30000)
    .stdout({ print: true })
    .command(['theme:component:generate', 'section-test'])
    .it('Test That The Generate Command Runs Successfully', async function (ctx) {
      expect(ctx.stdout).to.contain('Your new component is available at')
    })

  after(function () {
    chdir(workingDirectory)
  })
})
