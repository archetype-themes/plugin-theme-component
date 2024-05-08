/// External Dependencies
import assert from 'node:assert'
import { join } from 'node:path'
import { chdir, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe, it } from 'mocha'

// Internal Dependencies
import { chDirToDefault, setupComponentsRepo } from '../../../utils.js'
import Dev, { SETUP_FLAG_NAME, THEME_FLAG_NAME, WATCH_FLAG_NAME } from '../../../../src/commands/theme/component/dev.js'
import { LOCALES_FLAG_NAME } from '../../../../src/config/baseCommand.js'
import Session from '../../../../src/models/static/Session.js'
import { getCLIRootFolderName } from '../../../../src/utils/NodeUtils.js'

describe('dev command', async function () {
  before(async function () {
    this.timeout(10000)
    const componentsInstallPath = await setupComponentsRepo()
    chdir(componentsInstallPath)
  })

  test
    .timeout(10000)
    .stdout()
    .command([
      'theme:component:dev',
      '--no-watch',
      `--theme-path=https://${env.GITHUB_ID}:${env.GITHUB_TOKEN}@github.com/archetype-themes/expanse.git`
    ])
    .it('runs: component dev --no-watch', async function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  after(function () {
    chDirToDefault()
  })
})

describe('Dev', () => {
  describe('setSessionValues', () => {
    it('should set session values correctly with default values', async () => {
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

    it('should set session values correctly with setup-files as false', async () => {
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

    it('should set session values correctly with provided theme-path', async () => {
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

    it('should set session values correctly with provided theme-path from argv and setup-files as true from config (issues a warning)', async () => {
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

    it('should set session values correctly with provided theme-path and setup-files, with setup-files as true (issues a warning)', async () => {
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
})
