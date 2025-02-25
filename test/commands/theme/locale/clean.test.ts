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

  it('cleans unused translations from all locale files by default', async () => {
    await runCommand(['theme', 'locale', 'clean'])

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.not.have.property('unused')

    const enSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(enSchemaContent).to.not.have.property('unused')
  })

  it('cleans only schema files when target is set to schema', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'clean', '--target', 'schema'])

    const enSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(enSchemaContent).to.not.have.property('unused')

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    const backupEnDefaultContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.deep.equal(backupEnDefaultContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('cleans only storefront files when target is set to storefront', async () => {
    const backupDir = path.join(testThemePath, 'locales-backup')
    fs.cpSync(testThemeLocalesPath, backupDir, { recursive: true })

    await runCommand(['theme', 'locale', 'clean', '--target', 'storefront'])

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.not.have.property('unused')

    const enSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    const backupEnSchemaContent = JSON.parse(fs.readFileSync(path.join(backupDir, 'en.default.schema.json'), 'utf8'))
    expect(enSchemaContent).to.deep.equal(backupEnSchemaContent)

    fs.rmSync(backupDir, { force: true, recursive: true })
  })

  it('preserves used translations when cleaning', async () => {
    await runCommand(['theme', 'locale', 'clean'])

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.have.nested.property('actions.add_to_cart')

    const enSchemaContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.schema.json'), 'utf8'))
    expect(enSchemaContent).to.have.nested.property('section.name')
    expect(enSchemaContent).to.have.nested.property('section.settings.logo_label')
  })

  it('can be run from a theme directory without an argument', async () => {
    process.chdir(testThemePath)
    await runCommand(['theme', 'locale', 'clean'])

    const enDefaultContent = JSON.parse(fs.readFileSync(path.join(testThemeLocalesPath, 'en.default.json'), 'utf8'))
    expect(enDefaultContent).to.not.have.property('unused')
  })
})
