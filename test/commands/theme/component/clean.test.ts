import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component clean', () => {
  beforeEach(() => {
    fs.cpSync(collectionPath, testCollectionPath, {recursive: true})
    fs.cpSync(themePath, testThemePath, {recursive: true})
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    fs.rmSync(testCollectionPath, {force: true, recursive: true})
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('removes files that are no longer in the component.manifest.json file', async () => {
    await runCommand(['theme', 'component', 'clean', testThemePath])
    expect(fs.existsSync(path.join(testThemePath, 'snippets', 'missing.liquid'))).to.be.false
    expect(fs.existsSync(path.join(testThemePath, 'assets', 'missing.css'))).to.be.false
  })

  it('does not remove files that are still in the component.manifest.json file', async () => {
    await runCommand(['theme', 'component', 'clean', testThemePath])
    expect(fs.existsSync(path.join(testThemePath, 'snippets', 'theme-component.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testThemePath, 'assets', 'theme-component.css'))).to.be.true
  })

  it('can be run from a theme directory without an argument', async () => {
    process.chdir(testThemePath)
    await runCommand(['theme', 'component', 'clean'])
    expect(fs.existsSync(path.join(testThemePath, 'snippets', 'missing.liquid'))).to.be.false
    expect(fs.existsSync(path.join(testThemePath, 'assets', 'missing.css'))).to.be.false
  })
})
