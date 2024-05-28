// External Dependencies
import { chdir, cwd, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'

// Internal Dependencies
import { install } from '../../../../src/utils/externalComponents.js'
import { config } from 'dotenv'
import { basename, resolve } from 'node:path'
import { exists, getRandomTmpFolder, saveFile } from '../../../../src/utils/FileUtils.js'
import { mkdir } from 'node:fs/promises'

// Load .env test file
config({ path: ['.env.test.local', '.env.test'] })

const workingDirectory = cwd()

describe('Install Command File', function () {
  before(async function () {
    this.timeout(30000)
    const userDataFile = resolve(workingDirectory, 'user-info.json')
    if (!(await exists(userDataFile))) {
      await saveFile(resolve(workingDirectory, 'user-info.json'), '')
    }
    const themeRepoUrl = env.THEME_REPO ? env.THEME_REPO : 'https://github.com/archetype-themes/reference-theme.git'

    const themeName = basename(themeRepoUrl, '.git')
    const themeInstallPath = resolve(await getRandomTmpFolder(), themeName)
    await mkdir(themeInstallPath, { recursive: true })
    await install(themeRepoUrl, themeInstallPath)

    chdir(themeInstallPath)
  })

  const installCommand = ['theme:component:install']

  if (env.COMPONENTS_REPO) {
    installCommand.push('--components-path', env.COMPONENTS_REPO)
  }

  test
    .timeout(30000)
    .stdout({ print: true })
    .command(installCommand)
    .it('Test That The Install Command Runs Successfully', function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  after(function () {
    chdir(workingDirectory)
  })
})
