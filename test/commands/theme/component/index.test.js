import { expect, test } from '@oclif/test'
import { describe } from 'mocha'

describe('component command', () => {
  test
    .stdout()
    .command(['theme:component'])
    .it('runs component cmd', ctx => {
      expect(ctx.stdout).to.contain('Welcome To The Theme Component Plugin, by Archetype Themes.')
    })
  test
    .stdout()
    .command(['theme:component', '-v'])
    .it('runs component cmd', ctx => {
      expect(ctx.stdout).to.contain('Shopify CLI Version:')
      expect(ctx.stdout).to.contain('Theme Component Plugin Version:')
    })
})
