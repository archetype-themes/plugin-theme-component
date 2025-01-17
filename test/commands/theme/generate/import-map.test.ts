import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'

import Flags from '../../../../src/utilities/flags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme generate import-map', () => {
  beforeEach(() => {
    fs.cpSync(themePath, testThemePath, {recursive: true})
  })

  afterEach(() => {
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('generates empty import map when no JS files exist', async () => {
    await runCommand(['theme:generate:import-map', testThemePath])
    
    const importMapPath = path.join(testThemePath, 'snippets', 'import-map.liquid')
    const content = fs.readFileSync(importMapPath, 'utf8')
    
    const jsonContent = extractImportMapJson(content)
    expect(jsonContent).to.deep.equal({
      imports: {}
    })
  })

  it('generates import map with JS files', async () => {
    const assetsPath = path.join(testThemePath, 'assets')
    fs.writeFileSync(path.join(assetsPath, 'main.js'), '')
    fs.writeFileSync(path.join(assetsPath, 'utils.js'), '')
    
    await runCommand(['theme:generate:import-map', testThemePath])
    
    const importMapPath = path.join(testThemePath, 'snippets', 'import-map.liquid')
    const content = fs.readFileSync(importMapPath, 'utf8')
    
    const jsonContent = extractImportMapJson(content)
    expect(jsonContent).to.deep.equal({
      imports: {
        main: "{{ 'main.js' | asset_url }}",
        utils: "{{ 'utils.js' | asset_url }}"
      }
    })
  })

  it('does not include .min in the entry key', async () => {
    const assetsPath = path.join(testThemePath, 'assets')
    fs.writeFileSync(path.join(assetsPath, 'component.min.js'), '')
    
    await runCommand(['theme:generate:import-map', testThemePath])
    
    const importMapPath = path.join(testThemePath, 'snippets', 'import-map.liquid')
    const content = fs.readFileSync(importMapPath, 'utf8')
    
    const jsonContent = extractImportMapJson(content)
    expect(jsonContent).to.deep.equal({
      imports: {
        component: "{{ 'component.min.js' | asset_url }}",
      }
    })
  })

  it('respects quiet flag', async () => {
    const {stdout} = await runCommand(['theme:generate:import-map', testThemePath, `--${Flags.QUIET}`])
    expect(stdout).to.equal('')
  })

  it('handles missing assets directory', async () => {
    fs.rmSync(path.join(testThemePath, 'assets'), {force: true, recursive: true})
    const {error} = await runCommand(['theme:generate:import-map', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include(`Assets directory not found. Please ensure ${path.resolve(testThemePath)} is a theme directory.`)
  })

  it('handles missing snippets directory', async () => {
    fs.rmSync(path.join(testThemePath, 'snippets'), {force: true, recursive: true})
    const {error} = await runCommand(['theme:generate:import-map', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include(`Snippets directory not found. Please ensure ${path.resolve(testThemePath)} is a theme directory.`)
  })

  it('updates existing import map', async () => {
    const assetsPath = path.join(testThemePath, 'assets')
    fs.writeFileSync(path.join(assetsPath, 'main.js'), '')
    const importMapPath = path.join(testThemePath, 'snippets', 'import-map.liquid')
    const initialContent = `<script type="importmap">\n{\n  "imports": {}\n}\n</script>`
    fs.writeFileSync(importMapPath, initialContent)

    await runCommand(['theme:generate:import-map', testThemePath])
    
    const content = fs.readFileSync(importMapPath, 'utf8')
    const jsonContent = extractImportMapJson(content)
    expect(jsonContent).to.deep.equal({
      imports: {
        main: "{{ 'main.js' | asset_url }}"
      }
    })
  })
})

// Helper function to extract and parse JSON from import map script tag
function extractImportMapJson(content: string): object {
  const match = content.match(/<script type="importmap">\s*({[\S\s]*})\s*<\/script>/)
  if (!match) {
    throw new Error('Invalid import map format')
  }

  return JSON.parse(match[1])
}
