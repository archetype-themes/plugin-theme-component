import { chdir, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'
import { chDirToDefault, setupThemeRepo } from '../../../utils.js'

describe('install command', function () {
  before(async function () {
    this.timeout(10000)
    const themeInstallPath = await setupThemeRepo()
    chdir(themeInstallPath)
  })

  test
    .timeout(10000)
    .stdout()
    .command([
      'component:install',
      `--components-path=https://${env.GITHUB_ID}:${env.GITHUB_TOKEN}@github.com/archetype-themes/components.git`
    ])
    .it('runs: component install', function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  after(function () {
    chDirToDefault()
  })
})
