import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'

import {getCollectionInfo} from '../../../../src/utilities/config.js'
import {getThemeConfig} from '../../../../src/utilities/toml-config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('copy', () => {
  beforeEach(() => {
    // Setup test environment
    fs.cpSync(collectionPath, testCollectionPath, {recursive: true})
    fs.cpSync(themePath, testThemePath, {recursive: true})
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    fs.rmSync(testCollectionPath, {force: true, recursive: true})
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('errors when theme path is invalid', async () => {
    const {error, stderr  } = await runCommand(['theme', 'component', 'copy', 'invalid/path'])
    
    expect(error?.message).to.contain('does not appear to contain valid theme files.')
    expect(error?.oclif?.exit).to.equal(1)
  })

  it('copies a component and its assets', async () => {
    await runCommand(['theme', 'component', 'copy', testThemePath])
    
    // Verify only rendered snippets were copied
    const renderedSnippets = ['component-a', 'component-b', 'component-c', 'component-b-snippet']
    for (const snippet of renderedSnippets) {
      const snippetExists = fs.existsSync(path.join(testThemePath, 'snippets', `${snippet}.liquid`))
      expect(snippetExists).to.be.true
    }

    // Verify only unrendered snippets were not copied
    const unrenderedSnippets = ['component-a-snippet', 'component-d', 'component-d-snippet']
    for (const snippet of unrenderedSnippets) {
      const snippetExists = fs.existsSync(path.join(testThemePath, 'snippets', `${snippet}.liquid`))
      expect(snippetExists).to.be.false
    }

    // Make sure the component-c.liquid which has import set to @theme is not copied
    const componentCCollectionContents = fs.readFileSync(path.join(testCollectionPath, 'components', 'component-c', 'component-c.liquid'), 'utf8')
    const componentCThemeContents = fs.readFileSync(path.join(testThemePath, 'snippets', 'component-c.liquid'), 'utf8')
    const componentCExists = fs.existsSync(path.join(testThemePath, 'snippets', 'component-c.liquid'))
    expect(componentCExists).to.be.true
    expect(componentCThemeContents).to.not.equal(componentCCollectionContents)
  })

  it('updates the theme config with the collection name and version', async () => {
    const beforeConfig = getThemeConfig(path.join(testThemePath, 'shopify.theme.toml'))
    const {error, stderr} = await runCommand(['theme', 'component', 'copy', testThemePath])
    console.log(error)
    console.log(stderr)
    debugger;
    const pkg = await getCollectionInfo()
    const afterConfig = getThemeConfig(path.join(testThemePath, 'shopify.theme.toml'))

    expect(beforeConfig).to.not.deep.equal(afterConfig)
    expect(afterConfig.COMPONENTS?.COLLECTIONS?.[pkg.name]?.COLLECTION_VERSION).to.equal(pkg.version)
  })

  it('updates the theme config with the latest importmap values', async () => {
    const beforeConfig = getThemeConfig(path.join(testThemePath, 'shopify.theme.toml'))
    await runCommand(['theme', 'component', 'copy', testThemePath])
    const pkg = await getCollectionInfo()
    const afterConfig = getThemeConfig(path.join(testThemePath, 'shopify.theme.toml'))

    expect(beforeConfig).to.not.deep.equal(afterConfig)
    expect(afterConfig.COMPONENTS?.IMPORTMAP?.['component-a']).to.equal(pkg.name)
    expect(afterConfig.COMPONENTS?.IMPORTMAP?.['component-c']).to.equal('@theme')
  })
})
