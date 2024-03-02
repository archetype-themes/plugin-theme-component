import { chdir, cwd } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'
import { chDirToDefault, setupThemeRepo } from '../../../utils.js'

describe('install command', function () {
  before(async function () {
    console.log('CWD', cwd())
    this.timeout(10000)
    const themeInstallPath = await setupThemeRepo()
    chdir(themeInstallPath)
    console.log('CWD2', cwd())
  })

  test
    .timeout(10000)
    .stdout()
    .command(['theme:component:install'])
    .it('runs: component install', async function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  after(function () {
    chDirToDefault()
  })
})
