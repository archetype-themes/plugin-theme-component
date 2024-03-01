import { expect, test } from '@oclif/test'
import { describe } from 'mocha'

describe('component command', function () {
  test
    .stdout()
    .command(['theme:component'])
    .it('runs: component', ctx => {
      expect(ctx.stdout).to.contain('Welcome To The Theme Component Plugin, by Archetype Themes.')
    })
  test
    .stdout()
    .command(['theme:component', '-v'])
    .it('runs: component -v', ctx => {
      expect(ctx.stdout).to.contain('Shopify CLI Version:')
      expect(ctx.stdout).to.contain('Theme Component Plugin Version:')
    })
})
