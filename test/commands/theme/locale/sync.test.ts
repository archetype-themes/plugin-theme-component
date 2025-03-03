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
  const sourceEnDefault = JSON.parse(fs.readFileSync(path.join(localesPath, 'en.default.json'), 'utf8'))
  const sourceFr = JSON.parse(fs.readFileSync(path.join(localesPath, 'fr.json'), 'utf8'))

  beforeEach(() => {
    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testThemePath)
  })

  afterEach(() => {
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('syncs locale files from a local source', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath])

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

    expect(frStorefrontContent.actions.add_to_cart).to.equal(sourceFr.actions.add_to_cart)
  })

  it('syncs only schema files when target is set to schema', async () => {
    const originalStorefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    const originalSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--target', 'schema'])

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))

    expect(schemaContent.section.name).to.equal(originalSchemaContent.section.name)
    expect(schemaContent.section.settings.logo_label).to.equal(originalSchemaContent.section.settings.logo_label)

    expect(schemaContent).to.not.have.nested.property('additional.new_setting')

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.deep.equal(originalStorefrontContent)
  })

  it('syncs only storefront files when target is set to storefront', async () => {
    const originalSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--target', 'storefront'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.deep.equal(originalSchemaContent)
  })

  it('adds missing translations when mode is set to add-missing', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    const originalAddToCartValue = storefrontContent.actions.add_to_cart

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--mode', 'add-missing'])

    const updatedStorefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))

    expect(updatedStorefrontContent.actions.add_to_cart).to.equal(originalAddToCartValue)

    expect(updatedStorefrontContent).to.not.have.nested.property('additional.new_key')
  })

  it('replaces existing translations when mode is set to replace-existing', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    const originalAddToCartValue = storefrontContent.actions.add_to_cart

    expect(originalAddToCartValue).to.not.equal(sourceEnDefault.actions.add_to_cart)

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--mode', 'replace-existing'])

    const updatedStorefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))

    expect(updatedStorefrontContent.actions.add_to_cart).to.not.equal(originalAddToCartValue)
    expect(updatedStorefrontContent.actions.add_to_cart).to.equal(sourceEnDefault.actions.add_to_cart)
  })

  it('adds and overrides translations when mode is set to add-and-override', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    const originalAddToCartValue = storefrontContent.actions.add_to_cart

    expect(originalAddToCartValue).to.not.equal(sourceEnDefault.actions.add_to_cart)

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--mode', 'add-and-override'])

    const updatedStorefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))

    expect(updatedStorefrontContent.actions.add_to_cart).to.not.equal(originalAddToCartValue)
    expect(updatedStorefrontContent.actions.add_to_cart).to.equal(sourceEnDefault.actions.add_to_cart)

    expect(updatedStorefrontContent).to.not.have.nested.property('additional.new_key')
  })

  it('formats the output files when format flag is set', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--format'])

    const storefrontFileContent = fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8')
    expect(storefrontFileContent).to.include('  "actions": {')
    expect(storefrontFileContent).to.include('    "add_to_cart"')
  })

  it('cleans locale files when clean flag is set', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))

    expect(storefrontContent).to.not.have.property('unused')

    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.direct_key')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.variable_key')
  })

  it('syncs schema files with add-and-override mode', async () => {
    const sourceEnDefaultSchema = JSON.parse(fs.readFileSync(path.join(localesPath, 'en.default.schema.json'), 'utf8'))
    const originalSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))

    expect(originalSchemaContent.section.name).to.not.equal(sourceEnDefaultSchema.section.name)

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--target', 'schema', '--mode', 'add-and-override'])

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))

    expect(schemaContent.section.name).to.not.equal(originalSchemaContent.section.name)
    expect(schemaContent.section.name).to.equal(sourceEnDefaultSchema.section.name)
    expect(schemaContent.section.settings.logo_label).to.equal(sourceEnDefaultSchema.section.settings.logo_label)

    expect(schemaContent).to.not.have.nested.property('additional.new_setting')
  })

  it('does not add unreferenced translations', async () => {
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')
    const schemaFilePath = path.join(testThemeLocalesPath, 'en.default.schema.json')

    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath])

    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))
    const schemaContent = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'))

    expect(storefrontContent).to.not.have.nested.property('additional.new_key')
    expect(schemaContent).to.not.have.nested.property('additional.new_setting')

    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.direct_key')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.variable_key')
    expect(schemaContent).to.have.nested.property('section.name')
    expect(schemaContent).to.have.nested.property('section.settings.logo_label')
  })

  it('syncs dynamic translation keys with prefixes', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))

    expect(storefrontContent).to.have.nested.property('tags.new')
    expect(storefrontContent).to.have.nested.property('tags.sale')
    expect(storefrontContent).to.have.nested.property('tags.featured')
    expect(storefrontContent).to.have.nested.property('tags.custom')
    expect(storefrontContent).to.have.nested.property('tags.special')

    expect(storefrontContent.tags.new).to.equal(sourceEnDefault.tags.new)

    const frStorefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'fr.json'), 'utf8'))
    expect(frStorefrontContent).to.have.nested.property('tags.new')
    expect(frStorefrontContent.tags.new).to.equal(sourceFr.tags.new)
  })

  it('cleans dynamic translation keys but keeps referenced prefixes', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-source', localesPath, '--clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))

    expect(storefrontContent).to.have.nested.property('tags.new')

    // These should also be kept because they share the same prefix
    expect(storefrontContent).to.have.nested.property('tags.sale')
    expect(storefrontContent).to.have.nested.property('tags.featured')
  })
})
