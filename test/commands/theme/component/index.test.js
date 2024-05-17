import { expect, test } from '@oclif/test'
import { before, describe } from 'mocha'
import { config } from 'dotenv'
import { resolve } from 'node:path'
import { exists, saveFile } from '../../../../src/utils/FileUtils.js'
import { cwd } from 'node:process'

// Load .env test file
config({ path: ['.env.test.local', '.env.test'] })

const workingDirectory = cwd()

describe('component command', function () {
  before(async function () {
    const userDataFile = resolve(workingDirectory, 'user-info.json')
    if (!(await exists(userDataFile))) {
      await saveFile(resolve(workingDirectory, 'user-info.json'), '')
    }
  })
  test
    .stdout({ print: true })
    .command(['theme:component'])
    .it('runs: component', function (ctx) {
      expect(ctx.stdout).to.contain('Welcome To The Theme Component Plugin, by Archetype Themes.')
    })
  test
    .stdout({ print: true })
    .command(['theme:component', '-v'])
    .it('runs: component -v', function (ctx) {
      expect(ctx.stdout).to.contain('Shopify CLI Version:')
      expect(ctx.stdout).to.contain('Theme Component Plugin Version:')
    })
})
