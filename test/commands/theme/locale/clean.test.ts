import { runCommand } from '@oclif/test'
import { expect } from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const themePath = path.join(fixturesPath, 'theme')
const testThemePath = path.join(fixturesPath, 'test-theme')
const testThemeLocalesPath = path.join(testThemePath, 'locales')

describe('theme locale clean', () => {
  beforeEach(() => {
    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testThemePath)
  })

  afterEach(() => {
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('cleans unreferenced translations from all locale files by default', async () => {
    await runCommand(['theme', 'locale', 'clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.not.have.property('unused')

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.not.have.property('unused')
  })

  it('cleans only schema files when target is set to schema', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'clean', '--target', 'schema'])

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.not.have.property('unused')

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    const backupStorefrontContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.deep.equal(backupStorefrontContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('cleans only storefront files when target is set to storefront', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'clean', '--target', 'storefront'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.not.have.property('unused')

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    const backupSchemaContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.deep.equal(backupSchemaContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('preserves referenced translations when cleaning', async () => {
    await runCommand(['theme', 'locale', 'clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.direct_key')
    expect(storefrontContent).to.have.nested.property('t_with_fallback.variable_key')

    const schemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(schemaContent).to.have.nested.property('section.name')
    expect(schemaContent).to.have.nested.property('section.settings.logo_label')
  })

  it('can be run from a theme directory without an argument', async () => {
    process.chdir(testThemePath)
    await runCommand(['theme', 'locale', 'clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(storefrontContent).to.not.have.property('unused')
  })

  it('formats the output files when format flag is set', async () => {
    await runCommand(['theme', 'locale', 'clean', '--format'])

    const storefrontFileContent = fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8')

    expect(storefrontFileContent).to.include('  "actions": {')
    expect(storefrontFileContent).to.include('    "add_to_cart"')

    const storefrontContent = JSON.parse(storefrontFileContent)
    expect(storefrontContent).to.not.have.property('unused')
    expect(storefrontContent).to.have.nested.property('actions.add_to_cart')
  })

  it('formats only target files when used with target flag', async () => {
    const schemaFilePath = path.join(testThemeLocalesPath, 'en.default.schema.json')
    const storefrontFilePath = path.join(testThemeLocalesPath, 'en.default.json')

    const schemaContent = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'))
    const storefrontContent = JSON.parse(fs.readFileSync(storefrontFilePath, 'utf8'))

    fs.writeFileSync(schemaFilePath, JSON.stringify(schemaContent))
    fs.writeFileSync(storefrontFilePath, JSON.stringify(storefrontContent))

    await runCommand(['theme', 'locale', 'clean', '--format', '--target', 'schema'])

    const formattedSchemaFileContent = fs.readFileSync(schemaFilePath, 'utf8')
    const storefrontFileContent = fs.readFileSync(storefrontFilePath, 'utf8')

    expect(formattedSchemaFileContent).to.include('  "section": {')
    expect(formattedSchemaFileContent).to.include('    "name"')
    expect(storefrontFileContent).not.to.include('  "actions": {')
  })

  it('formats nested objects correctly when format flag is set', async () => {
    const schemaFilePath = path.join(testThemeLocalesPath, 'en.default.schema.json')
    const originalSchemaContent = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'))
    fs.writeFileSync(schemaFilePath, JSON.stringify(originalSchemaContent))

    await runCommand(['theme', 'locale', 'clean', '--format'])

    const formattedSchemaFileContent = fs.readFileSync(schemaFilePath, 'utf8')

    expect(formattedSchemaFileContent).to.include('  "section": {')
    expect(formattedSchemaFileContent).to.include('    "name"')
    expect(formattedSchemaFileContent).to.include('    "settings": {')
    expect(formattedSchemaFileContent).to.include('      "logo_label"')

    const formattedSchemaContent = JSON.parse(formattedSchemaFileContent)
    const keys = Object.keys(formattedSchemaContent)

    if (keys.length > 1) {
      const sectionIndex = keys.indexOf('section')
      const additionalIndex = keys.indexOf('additional')

      if (sectionIndex !== -1 && additionalIndex !== -1) {
        expect(additionalIndex).to.be.lessThan(sectionIndex)
      }
    }
  })

  it('preserves dynamic translation keys with prefixes', async () => {
    await runCommand(['theme', 'locale', 'sync', '--locales-source', path.join(fixturesPath, 'locales'), '--clean'])

    const storefrontContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))

    expect(storefrontContent).to.have.nested.property('tags.new')
    expect(storefrontContent).to.have.nested.property('tags.sale')
    expect(storefrontContent).to.have.nested.property('tags.featured')
    expect(storefrontContent).to.have.nested.property('tags.custom')
    expect(storefrontContent).to.have.nested.property('tags.special')

    expect(storefrontContent).to.not.have.property('unused')
  })
})
