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

    const content = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(content).to.have.nested.property('actions.add_to_cart')

    const frContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'fr.json'), 'utf8'))
    expect(frContent).to.have.nested.property('actions.add_to_cart')
  })

  it('syncs only schema files when target is set to schema', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--target', 'schema'])

    const enSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(enSchemaContent).to.have.nested.property('section.name')

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    const backupEnDefaultContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.deep.equal(backupEnDefaultContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('syncs only storefront files when target is set to storefront', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--target', 'storefront'])

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.have.nested.property('actions.add_to_cart')

    const enSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    const backupEnSchemaContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.schema.json'), 'utf8'))
    expect(enSchemaContent).to.deep.equal(backupEnSchemaContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('adds missing translations when mode is set to add-missing', async () => {
    const enDefaultPath = path.join(testThemeLocalesPath, 'en.default.json')
    const enDefault = JSON.parse(fs.readFileSync(enDefaultPath, 'utf8'))
    enDefault.custom = { key: 'This should not be changed' }
    fs.writeFileSync(enDefaultPath, JSON.stringify(enDefault, null, 2))

    const originalAddToCartValue = enDefault.actions.add_to_cart

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--mode', 'add-missing'])

    const content = JSON.parse(fs.readFileSync(enDefaultPath, 'utf8'))
    expect(content.custom.key).to.equal('This should not be changed')
    expect(content.actions.add_to_cart).to.equal(originalAddToCartValue)
  })

  it('replaces existing translations when mode is set to replace-existing', async () => {
    const enDefaultPath = path.join(testThemeLocalesPath, 'en.default.json')
    const enDefault = JSON.parse(fs.readFileSync(enDefaultPath, 'utf8'))
    const originalAddToCartValue = enDefault.actions.add_to_cart

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--mode', 'replace-existing'])

    const content = JSON.parse(fs.readFileSync(enDefaultPath, 'utf8'))
    expect(content.actions.add_to_cart).to.not.equal(originalAddToCartValue)
  })

  it('adds and overrides translations when mode is set to add-and-override', async () => {
    const enDefaultPath = path.join(testThemeLocalesPath, 'en.default.json')
    const enDefault = JSON.parse(fs.readFileSync(enDefaultPath, 'utf8'))
    enDefault.custom = { key: 'This should not be changed' }

    const originalAddToCartValue = enDefault.actions.add_to_cart

    fs.writeFileSync(enDefaultPath, JSON.stringify(enDefault, null, 2))

    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--mode', 'add-and-override'])

    const content = JSON.parse(fs.readFileSync(enDefaultPath, 'utf8'))
    expect(content.custom.key).to.equal('This should not be changed')

    expect(content.actions.add_to_cart).to.not.equal(originalAddToCartValue)
  })

  it('formats the output files when format flag is set', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--format'])

    const fileContent = fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8')

    expect(fileContent).to.include('  "actions": {')
    expect(fileContent).to.include('    "add_to_cart"')
  })

  it('cleans locale files when clean flag is set', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-dir', localesPath, '--clean'])

    const content = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(content).to.not.have.property('unused')

    expect(content).to.have.nested.property('actions.add_to_cart')
  })
})
