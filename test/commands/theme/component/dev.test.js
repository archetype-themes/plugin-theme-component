import { chdir, env } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'
import { chDirToDefault, setupComponentsRepo } from '../../../utils.js'

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
