import { chdir } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'
import { chDirToDefault, setupThemeRepo } from '../../../utils.js'

describe('install command', async function () {
  before(async function () {
    this.timeout(10000)
    const themeInstallPath = await setupThemeRepo()
    chdir(themeInstallPath)
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
