import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'
import sinon from 'sinon'

import Clean from '../../../../src/commands/theme/component/clean.js'
import Copy from '../../../../src/commands/theme/component/copy.js'
import Map from '../../../../src/commands/theme/component/map.js'
import GenerateImportMap from '../../../../src/commands/theme/generate/import-map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component install', () => {
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

  it('runs the theme component map command', async () => {
    const mapRunSpy = sandbox.spy(Map.prototype, 'run')

    await runCommand(['theme', 'component', 'install', '../test-theme'])

    expect(mapRunSpy.calledOnce).to.be.true
  })

  it('runs the theme component copy command', async () => {
    const copyRunSpy = sandbox.spy(Copy.prototype, 'run')

    await runCommand(['theme', 'component', 'install', '../test-theme'])

    expect(copyRunSpy.calledOnce).to.be.true
  })

  it('runs the theme component clean command', async () => {
    const cleanRunSpy = sandbox.spy(Clean.prototype, 'run')

    await runCommand(['theme', 'component', 'install', '../test-theme'])

    expect(cleanRunSpy.calledOnce).to.be.true
  })

  it('runs the theme component generate import map command', async () => {
    const generateImportMapRunSpy = sandbox.spy(GenerateImportMap.prototype, 'run')

    await runCommand(['theme', 'component', 'install', '../test-theme'])

    expect(generateImportMapRunSpy.calledOnce).to.be.true
  })
})
