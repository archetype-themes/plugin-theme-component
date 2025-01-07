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

function parseTemplateMap(content: string) {
  const match = content.match(/<script.*?data-template-map>(.*?)<\/script>/s)
  if (!match) throw new Error('No script tag found')
  return JSON.parse(match[1])
}

describe('theme generate template-map', () => {
  beforeEach(() => {
    // Clean up any existing test directory
    if (fs.existsSync(testThemePath)) {
      fs.rmSync(testThemePath, {force: true, recursive: true})
    }

    fs.cpSync(themePath, testThemePath, {recursive: true})
  })

  afterEach(() => {
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('generates empty template map when no template files exist', async () => {
    await runCommand(['theme:generate:template-map', testThemePath])
    
    const templateMapPath = path.join(testThemePath, 'snippets', 'template-map.liquid')
    const content = fs.readFileSync(templateMapPath, 'utf8')
    const parsed = parseTemplateMap(content)
    
    expect(parsed).to.deep.equal({
      json: {
        index: '{{ routes.root_url }}?view=json'
      }
    })
  })

  it('generates template map with template files', async () => {
    const templatesPath = path.join(testThemePath, 'templates')
    fs.mkdirSync(path.join(templatesPath, 'product'), {recursive: true})
    fs.writeFileSync(path.join(templatesPath, 'product.liquid'), '')
    fs.writeFileSync(path.join(templatesPath, 'product/with-reviews.liquid'), '')
    fs.writeFileSync(path.join(templatesPath, 'index.liquid'), '')

    await runCommand(['theme:generate:template-map', testThemePath])
    
    const templateMapPath = path.join(testThemePath, 'snippets', 'template-map.liquid')
    const content = fs.readFileSync(templateMapPath, 'utf8')
    const parsed = parseTemplateMap(content)
    
    expect(parsed).to.deep.equal({
      json: {
        index: '{{ routes.root_url }}?view=json'
      }
    })
  })

  it('respects quiet flag', async () => {
    const {stdout} = await runCommand(['theme:generate:template-map', testThemePath, `--${Flags.QUIET}`])
    expect(stdout).to.equal('')
  })

  it('handles missing templates directory', async () => {
    // Ensure clean state
    if (fs.existsSync(testThemePath)) {
      fs.rmSync(testThemePath, {force: true, recursive: true})
    }

    fs.mkdirSync(testThemePath, {recursive: true})

    const {error} = await runCommand(['theme:generate:template-map', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('The provided path')
    expect(error?.message).to.include('does not appear to contain valid theme files')
  })

  it('handles missing snippets directory', async () => {
    fs.rmSync(path.join(testThemePath, 'snippets'), {force: true, recursive: true})
    const {error} = await runCommand(['theme:generate:template-map', testThemePath])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('Snippets directory not found. Please ensure you are in a theme directory.')
  })

  it('includes all template types', async () => {
    const templatesPath = path.join(testThemePath, 'templates')
    fs.mkdirSync(path.join(templatesPath, 'customers'), {recursive: true})
    fs.writeFileSync(path.join(templatesPath, 'product.liquid'), '')
    fs.writeFileSync(path.join(templatesPath, 'collection.liquid'), '')
    fs.writeFileSync(path.join(templatesPath, 'customers/account.liquid'), '')
    fs.writeFileSync(path.join(templatesPath, 'customers/login.liquid'), '')

    await runCommand(['theme:generate:template-map', testThemePath])
    
    const templateMapPath = path.join(testThemePath, 'snippets', 'template-map.liquid')
    const content = fs.readFileSync(templateMapPath, 'utf8')
    const parsed = parseTemplateMap(content)
    
    expect(parsed).to.deep.equal({
      json: {
        index: '{{ routes.root_url }}?view=json'
      }
    })
  })

  it('handles nested template directories', async () => {
    const templatesPath = path.join(testThemePath, 'templates')
    fs.mkdirSync(path.join(templatesPath, 'customers'), {recursive: true})
    fs.writeFileSync(path.join(templatesPath, 'customers/account.liquid'), '')
    fs.writeFileSync(path.join(templatesPath, 'index.liquid'), '')

    await runCommand(['theme:generate:template-map', testThemePath])
    
    const templateMapPath = path.join(testThemePath, 'snippets', 'template-map.liquid')
    const content = fs.readFileSync(templateMapPath, 'utf8')
    const parsed = parseTemplateMap(content)
    
    expect(parsed).to.deep.equal({
      json: {
        index: '{{ routes.root_url }}?view=json'
      }
    })
  })
})
