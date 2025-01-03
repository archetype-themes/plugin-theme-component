import {expect} from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'
import {listComponentCollectionSnippets} from '../../src/utilities/theme-files'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../fixtures')
const collectionFixturePath = path.join(fixturesPath, 'collection')
const componentFixturePath = path.join(collectionFixturePath, 'components')

describe('theme-files utilities', () => {
  describe('listComponentCollectionSnippets', () => {
    const testComponentsDir = path.join(fixturesPath, 'test-components')

    beforeEach(() => {
      // Copy collection fixture files to test directory
      fs.cpSync(componentFixturePath, testComponentsDir, {recursive: true})
    })

    afterEach(() => {
      // Cleanup test directory
      fs.rmSync(testComponentsDir, {recursive: true, force: true})
    })

    it('should list snippets from component directories', async () => {
      const snippets = await listComponentCollectionSnippets(testComponentsDir)
      const snippetArray = Array.from(snippets)
      expect(snippetArray.map(snippet => snippet.name)).to.include.members([
        'component-a',
        'component-a-snippet',
        'component-b',
        'component-b-snippet',
        'component-c',
        'component-d',
        'component-d-snippet'
      ])
    })

    it('should throw error on duplicate snippet names', async () => {
      // Simulate duplicate snippet names by copying the same component twice
      const duplicateComponentPath = path.join(testComponentsDir, 'duplicate-component')
      const duplicateComponentFilePath = path.join(duplicateComponentPath, 'component-a.liquid')
      const newDuplicateComponentFilePath = path.join(duplicateComponentPath, 'duplicate-component.liquid')
      fs.cpSync(path.join(testComponentsDir, 'component-a'), duplicateComponentPath, {recursive: true})
      fs.renameSync(duplicateComponentFilePath, newDuplicateComponentFilePath)

      try {
        await listComponentCollectionSnippets(testComponentsDir)
        expect.fail('Expected error was not thrown')
      } catch (error: unknown) {
        if (error instanceof Error) {
          expect(error).to.be.an('error')
          expect(error.message).to.include('Duplicate snippet names found')
        }
      }
    })

    it('should handle empty directories', async () => {
      // Remove all files to simulate empty directory
      fs.rmSync(testComponentsDir, {recursive: true, force: true})
      fs.mkdirSync(testComponentsDir, {recursive: true})

      const snippets = await listComponentCollectionSnippets(testComponentsDir)
      expect(snippets.size).to.equal(0)
    })
  })
}) 