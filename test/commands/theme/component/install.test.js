// External Dependencies
import { chdir, cwd, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'

// Internal Dependencies
import { setupRepo } from '../../../../src/utils/ExternalComponentUtils.js'
import { config } from 'dotenv'
import { resolve } from 'node:path'
import { exists, saveFile } from '../../../../src/utils/FileUtils.js'

// Load .env test file
config({ path: ['.env.test.local', '.env.test'] })

const workingDirectory = cwd()

describe('Install Command File', function () {
  before(async function () {
    const userDataFile = resolve(workingDirectory, 'user-info.json')
    if (!(await exists(userDataFile))) {
      await saveFile(resolve(workingDirectory, 'user-info.json'), '')
    }
    const themeRepoUrl = env.THEME_REPO ? env.THEME_REPO : 'https://github.com/archetype-themes/reference-theme.git'
    const themeInstallPath = await setupRepo(themeRepoUrl)
    chdir(themeInstallPath)
  })

  test
    .timeout(10000)
    .stdout({ print: true })
    .command(['theme:component:install'])
    .it('Test That The Install Command Runs Successfully', function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  after(function () {
    chdir(workingDirectory)
  })
})
