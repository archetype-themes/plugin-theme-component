import { runCommand } from '@oclif/test'
import { expect } from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const localesPath = path.join(fixturesPath, 'locales')
const themePath = path.join(fixturesPath, 'theme')
const testThemePath = path.join(fixturesPath, 'test-theme')
const testThemeLocalesPath = path.join(testThemePath, 'locales')

describe('theme locale sync', () => {
  beforeEach(() => {
    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testThemePath)
  })

  afterEach(() => {
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('syncs locale files from a local source', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath])

    expect(fs.existsSync(path.join(testThemeLocalesPath, 'en.default.json'))).to.be.true
    expect(fs.existsSync(path.join(testThemeLocalesPath, 'en.default.schema.json'))).to.be.true
    expect(fs.existsSync(path.join(testThemeLocalesPath, 'fr.json'))).to.be.true
    expect(fs.existsSync(path.join(testThemeLocalesPath, 'fr.schema.json'))).to.be.true

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.direct_key')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.variable_key')

    const frStorefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'fr.json'), 'utf8'))
    expect(frStorefrontContent).to.have.nested.property('actions.add_to_cart')
    expect(frStorefrontContent).to.have.nested.property('t_with_fallback.direct_key')
    expect(frStorefrontContent).to.have.nested.property('t_with_fallback.variable_key')
  })

  it('syncs only schema files when target is set to schema', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--target', 'schema'])

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.have.nested.property('section.name')

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    const backupStorefrontContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.deep.equal(backupStorefrontContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('syncs only storefront files when target is set to storefront', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--target', 'storefront'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    const backupSchemaContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.deep.equal(backupSchemaContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('adds missing translations when mode is set to add-missing', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    storefrontContent.custom = { key: 'This should not be changed' }
    fs.writeFileSync(storefrontFilePath, JSON.stringify(storefrontContent, null, 2))

    const originalAddToCartValue = storefrontContent.actions.add_to_cart

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--mode', 'add-missing'])

    const updatedStorefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    expect(updatedStorefrontContent.custom.key).to.equal('This should not be changed')
    expect(updatedStorefrontContent.actions.add_to_cart).to.equal(originalAddToCartValue)
  })

  it('replaces existing translations when mode is set to replace-existing', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    const originalAddToCartValue = storefrontContent.actions.add_to_cart

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--mode', 'replace-existing'])

    const updatedStorefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    expect(updatedStorefrontContent.actions.add_to_cart).to.not.equal(originalAddToCartValue)
  })

  it('adds and overrides translations when mode is set to add-and-override', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    storefrontContent.custom = { key: 'This should not be changed' }

    const originalAddToCartValue = storefrontContent.actions.add_to_cart

    fs.writeFileSync(storefrontFilePath, JSON.stringify(storefrontContent, null, 2))

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--mode', 'add-and-override'])

    const updatedStorefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    expect(updatedStorefrontContent.custom.key).to.equal('This should not be changed')

    expect(updatedStorefrontContent.actions.add_to_cart).to.not.equal(originalAddToCartValue)
  })

  it('formats the output files when format flag is set', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--format'])

    const storefrontFileContent = fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8')

    expect(storefrontFileContent).to.include('  "actions": {')
    expect(storefrontFileContent).to.include('    "add_to_cart"')
  })

  it('cleans locale files when clean flag is set', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.not.have.property('unused')

    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.direct_key')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.variable_key')
  })
})
