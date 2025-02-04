import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import {execSync} from 'node:child_process'
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
    fs.rmSync(path.join(testThemePath, 'component.manifest.json'), {force: true})
    expect(fs.existsSync(path.join(testThemePath, 'component.manifest.json'))).to.be.false

    await runCommand(['theme', 'component', 'map', testThemePath])

    // Check that the file was created
    expect(fs.existsSync(path.join(testThemePath, 'component.manifest.json'))).to.be.true
  })

  it('updates the collection version in the component.map.json file', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(beforeData.collections['@archetype-themes/test-collection'].version).to.equal('1.0.0')

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.collections['@archetype-themes/test-collection'].version).to.equal('1.0.1')
  })

  it('adds missing assets and snippets file entries with an @theme value', async () => {
    // Check that missing entries are not present in map
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(beforeData.files.assets['missing.css']).to.be.undefined
    expect(beforeData.files.snippets['missing.liquid']).to.be.undefined

    await runCommand(['theme', 'component', 'map', testThemePath])

    // Check that missing entries are present in map
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.assets['missing.css']).to.equal('@theme')
    expect(data.files.snippets['missing.liquid']).to.equal('@theme')
  })

  it('adds entries for newly referenced components from current collection', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(beforeData.files.snippets['new.liquid']).to.be.undefined
    expect(beforeData.files.assets['new.css']).to.be.undefined

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.snippets['new.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['new.css']).to.equal('@archetype-themes/test-collection')
  })

  it('adds new entries for children of a referenced parent component', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(beforeData.files.snippets['parent.liquid']).to.be.undefined
    expect(beforeData.files.snippets['child.liquid']).to.be.undefined

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.snippets['parent.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['child.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('throws a warning if there is a potential conflict with an entry in the current collection', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(stdout).to.include('Conflict Warning: Pre-existing file')
    expect(data.files.snippets['conflict.liquid']).to.equal('@theme')
  })

  it('ignores conflicts if --ignore-conflicts flag is passed', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath, '--ignore-conflicts'])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(stdout).to.not.include('Conflict Warning: Pre-existing file')
    expect(data.files.snippets['conflict.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('throws a warning when an override is detected', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(stdout).to.include('Override Warning:')
    expect(data.files.snippets['override.liquid']).to.equal('@theme')
  })

  it('overriden parent still references non-overridden child from collection', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(stdout).to.include('Override Warning:')
    expect(data.files.snippets['override-parent.liquid']).to.equal('@theme')
    expect(data.files.snippets['override-child-a.liquid']).to.be.undefined
    expect(data.files.snippets['override-child-b.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('ignores overrides if --ignore-overrides flag is passed', async () => {
    const {stdout} = await runCommand(['theme', 'component', 'map', testThemePath, '--ignore-overrides'])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(stdout).to.not.include('Override Warning:')
    expect(data.files.snippets['override.liquid']).to.equal('@archetype-themes/test-collection')

    expect(data.files.snippets['override-parent.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['override-child-a.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['override-child-b.liquid']).to.be.undefined
  })

  it('removes old entries for removed components from current collection', async () => {
    // Check that old entries are present in map
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(beforeData.files.snippets['removed.liquid']).to.equal('@archetype-themes/test-collection')

    await runCommand(['theme', 'component', 'map', testThemePath])

    // Check that old entries are removed from map
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.snippets['removed.liquid']).to.be.undefined
  })

  it('does not add entries for unreferenced components from current collection', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.snippets['unreferenced.liquid']).to.be.undefined
    expect(data.files.assets['unreferenced.css']).to.be.undefined
    expect(data.files.snippets['unreferenced-snippet.liquid']).to.be.undefined
  })

  it('persists entries from other collections or @theme if those files still exist', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
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

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))

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
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    // Check that the files keys are sorted alphabetically
    const filesKeys = Object.keys(data.files)
    expect(filesKeys).to.deep.equal([...filesKeys].sort())

    // Check that the snippets keys are sorted alphabetically
    const snippetsKeys = Object.keys(data.files.snippets)
    expect(snippetsKeys).to.deep.equal([...snippetsKeys].sort())

    // Check that the assets keys are sorted alphabetically
    const assetsKeys = Object.keys(data.files.assets)
    expect(assetsKeys).to.deep.equal([...assetsKeys].sort())

    // Check that the collections keys are sorted alphabetically
    const collectionsKeys = Object.keys(data.collections)
    expect(collectionsKeys).to.deep.equal([...collectionsKeys].sort())
  })

  it('should only include specified components when using component selector', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath, 'new'])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    // Should include the selected component and its assets
    expect(data.files.snippets['new.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['new.css']).to.equal('@archetype-themes/test-collection')

    // Should not include unrelated components
    expect(data.files.snippets['parent.liquid']).to.be.undefined
    expect(data.files.snippets['child.liquid']).to.be.undefined
  })

  it('should include multiple components when using comma-separated component selector', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath, 'new,parent'])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    // Should include both selected components and their dependencies
    expect(data.files.snippets['new.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['new.css']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['parent.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['child.liquid']).to.equal('@archetype-themes/test-collection')
  })

  it('should only match component type nodes when using component selector', async () => {
    // Try to select a snippet that's not a component
    await runCommand(['theme', 'component', 'map', testThemePath, 'child'])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    // Should not include the snippet since it's not a component
    expect(data.files.snippets['child.liquid']).to.be.undefined
  })

  it('should include all components when using "*" as component selector', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    await runCommand(['theme', 'component', 'map', testThemePath, '*'])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    // Should include all components from the collection
    expect(data.files.snippets['new.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['new.css']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['parent.liquid']).to.equal('@archetype-themes/test-collection')
    expect(data.files.snippets['child.liquid']).to.equal('@archetype-themes/test-collection')
    
    // Should still maintain other collection entries
    for (const [key, value] of Object.entries(beforeData.files.snippets)
      .filter(([_, value]) => value !== '@archetype-themes/test-collection')) {
        if (fs.existsSync(path.join(testThemePath, 'snippets', key))) {
          expect(data.files.snippets[key]).to.equal(value)
        }
      }
  })

  it('should throw an error when no components match the selector', async () => {
    const beforeData = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    const {error} = await runCommand(['theme', 'component', 'map', testThemePath, 'non-existent'])

    // Should throw an error
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('No components found matching selector: non-existent')

    // Map should remain unchanged
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.snippets).to.deep.equal(beforeData.files.snippets)
    expect(data.files.assets).to.deep.equal(beforeData.files.assets)
  })

  it('should include shared js assets referenced in other JS files in the manifest', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.files.assets['shared-script.js']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['shared-script-dependency.js']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['unused-shared-script.js']).to.be.undefined
    expect(data.files.assets['shared-min-script.min.js']).to.equal('@archetype-themes/test-collection')
  })

  it('should detect JS imports from script tags with {{ "filename" | asset_url }} filter', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    expect(data.files.assets['script-with-filter.js']).to.equal('@archetype-themes/test-collection')
  })

  it('should detect JS imports snippets inside components', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    expect(data.files.assets['script-snippet-import.js']).to.equal('@archetype-themes/test-collection')
  })

  it('should detect JS imports from script tags with import statements', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    expect(data.files.assets['script-with-import.js']).to.equal('@archetype-themes/test-collection')
    expect(data.files.assets['shared-min-other.js']).to.equal('@archetype-themes/test-collection')
  })

  it('should not include commented out script imports', async () => {
    await runCommand(['theme', 'component', 'map', testThemePath])
    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    
    expect(data.files.assets['commented-script.js']).to.be.undefined
  })

  it('adds the last commit hash to the collection in the manifest', async () => {
    // Initialize git repo in test collection
    execSync('git init', { cwd: testCollectionPath })
    execSync('git config user.email "test@example.com"', { cwd: testCollectionPath })
    execSync('git config user.name "Test User"', { cwd: testCollectionPath })
    execSync('git add .', { cwd: testCollectionPath })
    execSync('git commit -m "Initial commit"', { cwd: testCollectionPath })
    
    // Get the commit hash we just created
    const expectedHash = execSync('git rev-parse HEAD', { 
      cwd: testCollectionPath,
      encoding: 'utf8'
    }).trim()

    await runCommand(['theme', 'component', 'map', testThemePath])

    const data = JSON.parse(fs.readFileSync(path.join(testThemePath, 'component.manifest.json'), 'utf8'))
    expect(data.collections['@archetype-themes/test-collection'].commit).to.equal(expectedHash)
  })
})
