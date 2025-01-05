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

describe('theme component map', () => {
  beforeEach(() => {
    fs.cpSync(collectionPath, testCollectionPath, {recursive: true})
    fs.cpSync(themePath, testThemePath, {recursive: true})
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    fs.rmSync(testCollectionPath, {force: true, recursive: true})
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('should throw an error if the cwd is not a component collection', async () => {
    process.chdir(testThemePath)
    const {error} = await runCommand(['theme', 'component', 'map', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('Warning: Current directory does not appear to be a component collection. Expected to find package.json and components directory.')
  })

  it('should throw an error if a theme directory is not provided', async () => {
    const {error} = await runCommand(['theme', 'component', 'map'])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('Missing 1 required arg:')
  })

  it('creates a component.map.json in current theme directory if it does not exist', async () => {
    // Confirm that the file does not exist
    fs.rmSync(path.join(testThemePath, 'component-map.json'), {force: true})
    expect(fs.existsSync(path.join(testThemePath, 'component-map.json'))).to.be.false

    await runCommand(['theme', 'component', 'map', testThemePath])

    // Check that the file was created
    expect(fs.existsSync(path.join(testThemePath, 'component-map.json'))).to.be.true
  })

  it('updates the collection version in the component.map.json file', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(beforeData.collections['@archetype-themes/test-collection'].version).to.equal('1.0.0')

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(data.collections['@archetype-themes/test-collection'].version).to.equal('1.0.1')
  })

  it('adds missing assets and snippets file entries with an @theme value', async () => {
    // Check that missing entries are not present in map
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(beforeData.files.assets['missing.css']).to.be.undefined
    expect(beforeData.files.snippets['missing.liquid']).to.be.undefined

    await runCommand(['theme', 'component', 'map', testThemePath])

    // Check that missing entries are present in map
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(data.files.assets['missing.css']).to.equal('@theme')
    expect(data.files.snippets['missing.liquid']).to.equal('@theme')
  })

  it('adds entries for newly referenced components from current collection', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(beforeData.files.snippets['new.liquid']).to.be.undefined
    expect(beforeData.files.assets['new.css']).to.be.undefined

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(data.files.snippets['new.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['new.css']).to.equal('@archetype-themes/test-collection')
  })

  it('adds new entries for children of a referenced parent component', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(beforeData.files.snippets['parent.liquid']).to.be.undefined
    expect(beforeData.files.snippets['child.liquid']).to.be.undefined

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(data.files.snippets['parent.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['child.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('throws a warning if there is a potential conflict with an entry in the current collection', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(stdout).to.include('Conflict Warning: Pre-existing file')
    expect(data.files.snippets['conflict.liquid']).to.equal('@theme')
  })

  it('ignores conflicts if --ignore-conflicts flag is passed', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath, '--ignore-conflicts'])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(stdout).to.not.include('Conflict Warning: Pre-existing file')
    expect(data.files.snippets['conflict.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('throws a warning when an override is detected', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(stdout).to.include('Override Warning:')
    expect(data.files.snippets['override.liquid']).to.equal('@theme')
  })

  it('overriden parent still references non-overridden child from collection', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(stdout).to.include('Override Warning:')
    expect(data.files.snippets['override-parent.liquid']).to.equal('@theme')
    expect(data.files.snippets['override-child-a.liquid']).to.be.undefined
    expect(data.files.snippets['override-child-b.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('ignores overrides if --ignore-overrides flag is passed', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath, '--ignore-overrides'])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(stdout).to.not.include('Override Warning:')
    expect(data.files.snippets['override.liquid']).to.equal('@archetype-themes/test-collection')

    expect(data.files.snippets['override-parent.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['override-child-a.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['override-child-b.liquid']).to.be.undefined
  })

  it('removes old entries for removed components from current collection', async () => {
    // Check that old entries are present in map
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(beforeData.files.snippets['removed.liquid']).to.equal('@archetype-themes/test-collection')

    await runCommand(['theme', 'component', 'map', testThemePath])

    // Check that old entries are removed from map
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(data.files.snippets['removed.liquid']).to.be.undefined
  })

  it('does not add entries for unreferenced components from current collection', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    expect(data.files.snippets['unreferenced.liquid']).to.be.undefined
    expect(data.files.assets['unreferenced.css']).to.be.undefined
    expect(data.files.snippets['unreferenced-snippet.liquid']).to.be.undefined
  })

  it('persists entries from other collections or @theme if those files still exist', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    
    // Check that referenced files are present in map
    expect(beforeData.files.snippets['theme-component.liquid']).to.equal('@theme')
    expect(beforeData.files.assets['theme-component.css']).to.equal('@theme')
    expect(beforeData.files.snippets['other-collection-component.liquid']).to.equal('@other/collection')
    expect(beforeData.files.assets['other-collection-component.css']).to.equal('@other/collection')

    // Check that removed files are present in map
    expect(beforeData.files.snippets['theme-component-removed.liquid']).to.equal('@theme')
    expect(beforeData.files.assets['theme-component-removed.css']).to.equal('@theme')
    expect(beforeData.files.snippets['other-collection-component-removed.liquid']).to.equal('@other/collection')
    expect(beforeData.files.assets['other-collection-component-removed.css']).to.equal('@other/collection')

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))

    // Check that referenced files are still present in map
    expect(data.files.snippets['theme-component.liquid']).to.equal('@theme')
    expect(data.files.assets['theme-component.css']).to.equal('@theme')
    expect(data.files.snippets['other-collection-component.liquid']).to.equal('@other/collection')
    expect(data.files.assets['other-collection-component.css']).to.equal('@other/collection')

    // Check that removed files are no longer present in map
    expect(data.files.snippets['theme-component-removed.liquid']).to.be.undefined
    expect(data.files.assets['theme-component-removed.css']).to.be.undefined
    expect(data.files.snippets['other-collection-component-removed.liquid']).to.be.undefined
    expect(data.files.assets['other-collection-component-removed.css']).to.be.undefined
  })

  it('sorts the files and collections keys in the component.map.json file', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component-map.json'), 'utf8'))
    // Check that the files keys are sorted alphabetically
    const filesKeys = Object.keys(data.files)
    expect(filesKeys).to.deep.equal(filesKeys.slice().sort())

    // Check that the snippets keys are sorted alphabetically
    const snippetsKeys = Object.keys(data.files.snippets)
    expect(snippetsKeys).to.deep.equal(snippetsKeys.slice().sort())

    // Check that the assets keys are sorted alphabetically
    const assetsKeys = Object.keys(data.files.assets)
    expect(assetsKeys).to.deep.equal(assetsKeys.slice().sort())

    // Check that the collections keys are sorted alphabetically
    const collectionsKeys = Object.keys(data.collections)
    expect(collectionsKeys).to.deep.equal(collectionsKeys.slice().sort())
  })
})
