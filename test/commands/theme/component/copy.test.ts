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

describe('theme component copy', () => {
  beforeEach(() => {
    fs.cpSync(collectionPath, testCollectionPath, {recursive: true})
    fs.cpSync(themePath, testThemePath, {recursive: true})
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    fs.rmSync(testCollectionPath, {force: true, recursive: true})
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('throws an error if the cwd is not a component collection', async () => {
    process.chdir(testThemePath)
    const {error} = await runCommand(['theme', 'component', 'copy', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('Warning: Current directory does not appear to be a component collection.')
  })

  it('throws an error if the component.manifest.json file is not found in the theme directory', async () => {
    process.chdir(testCollectionPath)
    fs.rmSync(path.join(testThemePath, 'component.manifest.json'), {force: true})
    const {error} = await runCommand(['theme', 'component', 'copy', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('Error: component.manifest.json file not found in the theme directory.')
  })

  it('throws an error if the version of the component collection does not match the version in the component.manifest.json file', async () => {
    process.chdir(testCollectionPath)
    const {error} = await runCommand(['theme', 'component', 'copy', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('Version mismatch:')
  })

  it('copies files from a component collection to a theme directory based on component.manifest.json', async () => {
    const manifestPath = path.join(testThemePath, 'component.manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    manifest.collections["@archetype-themes/test-collection"].version = "1.0.1"
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    await runCommand(['theme', 'component', 'copy', testThemePath])

    expect(fs.existsSync(path.join(testThemePath, 'snippets', 'to-be-copied.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testThemePath, 'snippets', 'to-be-copied-snippet.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testThemePath, 'assets', 'to-be-copied.css'))).to.be.true
    expect(fs.existsSync(path.join(testThemePath, 'assets', 'to-be-copied.js'))).to.be.true

    expect(fs.existsSync(path.join(testThemePath, 'snippets', 'not-to-be-copied.liquid'))).to.be.false
  })
})
