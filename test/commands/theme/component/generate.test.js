import { chdir } from 'node:process'
import { expect, test } from '@oclif/test'
import { after, before, describe } from 'mocha'
import { chDirToDefault, setupComponentsRepo } from '../../../utils.js'

describe('generate command', async function () {
  before(async function () {
    this.timeout(10000)
    const componentsInstallPath = await setupComponentsRepo()
    chdir(componentsInstallPath)
  })

  test
    .timeout(10000)
    .stdout()
    .command(['generate', 'section-test'])
    .it('runs: component generate section-test', async function (ctx) {
      expect(ctx.stdout).to.contain('Your new component is available at')
    })

  after(function () {
    chDirToDefault()
  })
})
