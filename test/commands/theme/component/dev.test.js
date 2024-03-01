import { chdir } from 'node:process'
import { expect, test } from '@oclif/test'
import { before, describe } from 'mocha'
import { setupComponentsRepo } from '../../../utils.js'

before(async () => {
  const componentRepoPath = await setupComponentsRepo()
  chdir(componentRepoPath)
})

describe('dev command', () => {
  test
    .timeout(20000)
    .stdout()
    .command(['theme:component:dev', '--no-watch'])
    .it('runs component cmd', async ctx => {
      expect(ctx.stdout).to.contain('Install Complete')
    })
})
