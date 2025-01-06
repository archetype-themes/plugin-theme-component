import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'
import sinon from 'sinon'
import Install from '../../../../src/commands/theme/component/install.js'
import GenerateTemplateMap from '../../../../src/commands/theme/generate/template-map.js'
import GenerateImportMap from '../../../../src/commands/theme/generate/import-map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component dev', () => {
  beforeEach(() => {
    fs.cpSync(collectionPath, testCollectionPath, {recursive: true})
    fs.cpSync(themePath, testThemePath, {recursive: true})
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    fs.rmSync(testCollectionPath, {force: true, recursive: true})
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('copies the component setup files to the dev directory', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme'])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup.liquid'))).to.be.true
  })

  it('copies a selected component setup file to the dev directory', async () => {
    await runCommand(['theme', 'component', 'dev', 'with-setup', '-t', '../test-theme',])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup.liquid'))).to.be.true

    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup-other.liquid'))).to.be.false
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup-other.liquid'))).to.be.false
  })

  it('runs the install command', async () => {
    const installRunSpy = sinon.spy(Install.prototype, 'run')

    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme'])

    expect(installRunSpy.calledOnce).to.be.true
    installRunSpy.restore()
  })

  // it('runs the generate import map command', async () => {
  //   const generateImportMapRunSpy = sinon.spy(GenerateImportMap.prototype, 'run')

  //   const {error, stdout} = await runCommand(['theme', 'component', 'dev', '-t', '../test-theme', '--no-preview', '--no-watch'])
  //   console.log(stdout)
  //   console.log(error)
  //   expect(generateImportMapRunSpy.calledOnce).to.be.true
  //   generateImportMapRunSpy.restore()
  // })

  it('runs the generate template map command', async () => {
    const generateTemplateMapRunSpy = sinon.spy(GenerateTemplateMap.prototype, 'run')

    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme', '--no-preview', '--no-watch'])

    expect(generateTemplateMapRunSpy.calledOnce).to.be.true
    generateTemplateMapRunSpy.restore()
  })
})
