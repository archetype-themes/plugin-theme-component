import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import chokidar, { FSWatcher } from 'chokidar'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'
import sinon from 'sinon'

import Install from '../../../../src/commands/theme/component/install.js'
import GenerateImportMap from '../../../../src/commands/theme/generate/import-map.js'
import GenerateTemplateMap from '../../../../src/commands/theme/generate/template-map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component dev', () => {
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    fs.cpSync(collectionPath, testCollectionPath, {recursive: true})
    fs.cpSync(themePath, testThemePath, {recursive: true})
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    sandbox.restore()
    fs.rmSync(testCollectionPath, {force: true, recursive: true})
    fs.rmSync(testThemePath, {force: true, recursive: true})
  })

  it('copies the component setup files to the dev directory', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme'])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup.liquid'))).to.be.true
  })

  it('merges the settings_schema.json setup files', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme'])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'config', 'settings_schema.json'))).to.be.true
    const json = fs.readFileSync(path.join(testCollectionPath, '.dev', 'config', 'settings_schema.json'), 'utf8')
    const jsonObject = JSON.parse(json)
    expect(jsonObject).to.have.deep.members([{ name: "schema_1" }, { name: "schema_2" }, { name: "schema_3" }])

  })

  it('merges the settings_data.json setup files', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme'])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'config', 'settings_data.json'))).to.be.true
    const json = fs.readFileSync(path.join(testCollectionPath, '.dev', 'config', 'settings_data.json'), 'utf8')
    const jsonObject = JSON.parse(json)
    expect(jsonObject.presets.Default.value_1).to.be.true
    expect(jsonObject.presets.Default.value_2).to.be.true
  })

  it('copies a selected component setup file to the dev directory', async () => {
    await runCommand(['theme', 'component', 'dev', 'with-setup', '-t', '../test-theme',])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup.liquid'))).to.be.true

    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup-other.liquid'))).to.be.false
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup-other.liquid'))).to.be.false
  })

  it('runs the install command', async () => {
    const installRunSpy = sandbox.spy(Install.prototype, 'run')

    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme'])

    expect(installRunSpy.calledOnce).to.be.true
  })

  it('runs the generate import map command', async () => {
    const generateImportMapRunSpy = sandbox.spy(GenerateImportMap.prototype, 'run')

    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme', '--no-preview', '--no-watch'])
    
    expect(generateImportMapRunSpy.callCount).to.be.greaterThan(0)
    expect(generateImportMapRunSpy.called).to.be.true
  })

  it('runs the generate template map command', async () => {
    const generateTemplateMapRunSpy = sandbox.spy(GenerateTemplateMap.prototype, 'run')

    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme', '--no-preview', '--no-watch'])

    expect(generateTemplateMapRunSpy.calledOnce).to.be.true
  })

  it('watches for changes to the theme and components and rebuilds the theme', async () => {
    const watchStub = sandbox.stub(chokidar, 'watch')
    // Mock the watch method to return a minimal watcher interface
    const onStub = sandbox.stub()
    const mockWatcher: Partial<FSWatcher> = {
      emit: sandbox.stub(),
      on: onStub
    }
    watchStub.returns(mockWatcher as FSWatcher)

    // Set NODE_ENV to test
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'

    await runCommand(['theme', 'component', 'dev', '-t', '../test-theme', '--watch', '--no-preview'])

    expect(watchStub.calledOnce).to.be.true
    expect(watchStub.firstCall.args[0]).to.deep.equal([path.join(testThemePath), path.join(testCollectionPath, 'components')])
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv
  })
})
