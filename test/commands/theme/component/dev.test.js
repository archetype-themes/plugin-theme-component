/// External Dependencies
import assert from 'node:assert'
import { basename, join, resolve } from 'node:path'
import { chdir, cwd, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { config } from 'dotenv'
import { after, before, describe, it } from 'mocha'

// Internal Dependencies
import Dev, { SETUP_FLAG_NAME, THEME_FLAG_NAME, WATCH_FLAG_NAME } from '../../../../src/commands/theme/component/dev.js'
import { LOCALES_FLAG_NAME } from '../../../../src/config/baseCommand.js'
import Session from '../../../../src/models/static/Session.js'
import { install } from '../../../../src/utils/externalComponents.js'
import { exists, getRandomTmpFolder, saveFile } from '../../../../src/utils/FileUtils.js'
import { getCLIRootFolderName } from '../../../../src/utils/NodeUtils.js'
import { mkdir } from 'node:fs/promises'

// Load .env test file
config({ path: ['.env.test.local', '.env.test'] })

const workingDirectory = cwd()

describe('Dev Command File', async function () {
  before(async function () {
    this.timeout(30000)
    const userDataFile = resolve(workingDirectory, 'user-info.json')
    if (!(await exists(userDataFile))) {
      await saveFile(resolve(workingDirectory, 'user-info.json'), '')
    }
    const componentsRepoUrl = env.COMPONENTS_REPO
      ? env.COMPONENTS_REPO
      : 'https://github.com/archetype-themes/reference-components.git'

    const collectionName = basename(componentsRepoUrl, '.git')
    const componentsInstallPath = resolve(await getRandomTmpFolder(), collectionName)
    await mkdir(componentsInstallPath, { recursive: true })
    await install(componentsRepoUrl, componentsInstallPath)

    chdir(componentsInstallPath)
  })

  const devCommand = ['theme:component:dev', '--no-watch']

  if (env.THEME_REPO) {
    devCommand.push('--theme-path', env.THEME_REPO)
  }

  test
    .timeout(30000)
    .stdout({ print: true })
    .command(devCommand)
    .it('Test That The Dev Command Runs Successfully', async function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  describe("Test The Dev.setSessionValues Method's Logic", () => {
    it('Test Dev.setSessionValues Behaviour With Default Values', async () => {
      const argv = []
      const flags = {
        [LOCALES_FLAG_NAME]: Dev.flags[LOCALES_FLAG_NAME].default,
        [SETUP_FLAG_NAME]: Dev.flags[SETUP_FLAG_NAME].default,
        [THEME_FLAG_NAME]: Dev.flags[THEME_FLAG_NAME].default,
        [WATCH_FLAG_NAME]: Dev.flags[WATCH_FLAG_NAME].default
      }
      const metadata = {
        flags: {
          [LOCALES_FLAG_NAME]: {
            setFromDefault: true
          },
          [SETUP_FLAG_NAME]: {
            setFromDefault: true
          },
          [THEME_FLAG_NAME]: {
            setFromDefault: true
          },
          [WATCH_FLAG_NAME]: {
            setFromDefault: true
          }
        }
      }

      const tomlConfig = null
      await Dev.setSessionValues(argv, flags, metadata, tomlConfig)

      assert.strictEqual(Session.callerType, 'collection')
      assert.deepStrictEqual(Session.components, null)
      assert.strictEqual(Session.localesPath, Dev.flags[LOCALES_FLAG_NAME].default)
      assert.strictEqual(Session.watchMode, Dev.flags[WATCH_FLAG_NAME].default)
      assert.strictEqual(Session.setupFiles, Dev.flags[SETUP_FLAG_NAME].default)
      assert.strictEqual(Session.themePath, join(getCLIRootFolderName(), 'resources/explorer'))
    })

    it('Test Dev.setSessionValues Behaviour With setup-files Flag As false', async () => {
      const argv = []
      const flags = {
        [LOCALES_FLAG_NAME]: Dev.flags[LOCALES_FLAG_NAME].default,
        [SETUP_FLAG_NAME]: false,
        [THEME_FLAG_NAME]: Dev.flags[THEME_FLAG_NAME].default,
        [WATCH_FLAG_NAME]: Dev.flags[WATCH_FLAG_NAME].default
      }
      const metadata = {
        flags: {
          [LOCALES_FLAG_NAME]: {
            setFromDefault: true
          },
          [SETUP_FLAG_NAME]: {
            setFromDefault: false
          },
          [THEME_FLAG_NAME]: {
            setFromDefault: true
          },
          [WATCH_FLAG_NAME]: {
            setFromDefault: true
          }
        }
      }

      const tomlConfig = null
      await Dev.setSessionValues(argv, flags, metadata, tomlConfig)

      assert.strictEqual(Session.callerType, 'collection')
      assert.deepStrictEqual(Session.components, null)
      assert.strictEqual(Session.localesPath, Dev.flags[LOCALES_FLAG_NAME].default)
      assert.strictEqual(Session.watchMode, Dev.flags[WATCH_FLAG_NAME].default)
      assert.strictEqual(Session.setupFiles, false)
      assert.strictEqual(Session.themePath, Dev.flags[THEME_FLAG_NAME].default)
    })

    it('Test Dev.setSessionValues Behaviour With A Custom theme-path', async () => {
      const argv = []
      const flags = {
        [LOCALES_FLAG_NAME]: Dev.flags[LOCALES_FLAG_NAME].default,
        [SETUP_FLAG_NAME]: Dev.flags[SETUP_FLAG_NAME].default,
        [THEME_FLAG_NAME]: 'https://github.com/archetype-themes/expanse.git',
        [WATCH_FLAG_NAME]: Dev.flags[WATCH_FLAG_NAME].default
      }
      const metadata = {
        flags: {
          [LOCALES_FLAG_NAME]: {
            setFromDefault: true
          },
          [SETUP_FLAG_NAME]: {
            setFromDefault: true
          },
          [THEME_FLAG_NAME]: {
            setFromDefault: false
          },
          [WATCH_FLAG_NAME]: {
            setFromDefault: true
          }
        }
      }

      const tomlConfig = null
      await Dev.setSessionValues(argv, flags, metadata, tomlConfig)

      assert.strictEqual(Session.callerType, 'collection')
      assert.deepStrictEqual(Session.components, null)
      assert.strictEqual(Session.localesPath, Dev.flags[LOCALES_FLAG_NAME].default)
      assert.strictEqual(Session.watchMode, Dev.flags[WATCH_FLAG_NAME].default)
      assert.strictEqual(Session.setupFiles, false)
      assert.strictEqual(Session.themePath, 'https://github.com/archetype-themes/expanse.git')
    })

    it('Test That Dev.setSessionValues Issues A Warning With A Custom theme-path From argv And setup-files As true From Toml config', async () => {
      const argv = []
      const flags = {
        [LOCALES_FLAG_NAME]: Dev.flags[LOCALES_FLAG_NAME].default,
        [SETUP_FLAG_NAME]: Dev.flags[SETUP_FLAG_NAME].default,
        [THEME_FLAG_NAME]: 'https://github.com/archetype-themes/expanse.git',
        [WATCH_FLAG_NAME]: Dev.flags[WATCH_FLAG_NAME].default
      }
      const metadata = {
        flags: {
          [LOCALES_FLAG_NAME]: {
            setFromDefault: true
          },
          [SETUP_FLAG_NAME]: {
            setFromDefault: true
          },
          [THEME_FLAG_NAME]: {
            setFromDefault: false
          },
          [WATCH_FLAG_NAME]: {
            setFromDefault: true
          }
        }
      }

      const tomlConfig = { [SETUP_FLAG_NAME]: true }
      await Dev.setSessionValues(argv, flags, metadata, tomlConfig)

      assert.strictEqual(Session.callerType, 'collection')
      assert.deepStrictEqual(Session.components, null)
      assert.strictEqual(Session.localesPath, Dev.flags[LOCALES_FLAG_NAME].default)
      assert.strictEqual(Session.watchMode, Dev.flags[WATCH_FLAG_NAME].default)
      assert.strictEqual(Session.setupFiles, false)
      assert.strictEqual(Session.themePath, 'https://github.com/archetype-themes/expanse.git')
    })

    it('Test That Dev.setSessionValues Issues A Warning With A Custom theme-path And setup-files As true', async () => {
      const argv = ['section-alpha', 'shopping-cart']
      const flags = {
        [LOCALES_FLAG_NAME]: Dev.flags[LOCALES_FLAG_NAME].default,
        [SETUP_FLAG_NAME]: true,
        [THEME_FLAG_NAME]: 'https://github.com/archetype-themes/vino.git',
        [WATCH_FLAG_NAME]: false
      }
      const metadata = {
        flags: {
          [LOCALES_FLAG_NAME]: {
            setFromDefault: true
          },
          [SETUP_FLAG_NAME]: {
            setFromDefault: false
          },
          [THEME_FLAG_NAME]: {
            setFromDefault: false
          },
          [WATCH_FLAG_NAME]: {
            setFromDefault: false
          }
        }
      }

      // Testing that these are ignored since ARGV have a priority
      const tomlConfig = {
        [SETUP_FLAG_NAME]: false,
        [THEME_FLAG_NAME]: 'https://github.com/archetype-themes/expanse.git'
      }
      await Dev.setSessionValues(argv, flags, metadata, tomlConfig)

      assert.strictEqual(Session.callerType, 'collection')
      assert.deepStrictEqual(Session.components, ['section-alpha', 'shopping-cart'])
      assert.strictEqual(Session.localesPath, Dev.flags[LOCALES_FLAG_NAME].default)
      assert.strictEqual(Session.watchMode, false)
      assert.strictEqual(Session.setupFiles, true)
      assert.strictEqual(Session.themePath, join(getCLIRootFolderName(), 'resources/explorer'))
    })
  })

  after(function () {
    chdir(workingDirectory)
  })
})
