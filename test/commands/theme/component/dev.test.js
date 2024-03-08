import { chdir } from 'node:process'
import { expect, test } from '@oclif/test'
import { describe } from 'mocha'
import { chDirToDefault, setupComponentsRepo } from '../../../utils.js'

describe('dev command', function () {
  this.timeout(10000)
  const componentsInstallPath = await setupComponentsRepo()
  chdir(componentsInstallPath)

  test
    .timeout(10000)
    .stdout()
    .command(['theme:component:dev', '--no-watch'])
    .it('runs: component dev --no-watch', async function (ctx) {
      expect(ctx.stdout).to.contain('Install Complete')
    })

  chDirToDefault()

})
