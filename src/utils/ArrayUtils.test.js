import { describe, expect, test } from 'vitest'
import { mergeObjectArraysByUniqueKey } from './ArrayUtils.js'

describe('mergeObjectArraysByUniqueKey', () => {
  test('Merges Two Object Arrays. Merge with no conflicts.', () => {
    const oldArray = [{
      name: 'alpha',
      key: {
        tag: 'alpha',
        value: 'alpha'
      }
    }]
    const newArray = [{
      name: 'beta',
      key: {
        tag: 'beta',
        value: 'beta'
      }
    }]
    const expectedMergedArray = [{
      name: 'alpha',
      key: {
        tag: 'alpha',
        value: 'alpha'
      }
    }, {
      name: 'beta',
      key: {
        tag: 'beta',
        value: 'beta'
      }
    }]
    expect(mergeObjectArraysByUniqueKey(oldArray, newArray)).toStrictEqual(expectedMergedArray)
  })

  test('Merges Two Object Arrays. Merge with dual alpha name conflict.', () => {
    const oldArray = [{
      name: 'alpha',
      key: {
        tag: 'alpha',
        value: 'alpha'
      }
    }]
    const newArray = [{
      name: 'alpha',
      key: {
        tag: 'alpha-new',
        value: 'alpha-new'
      }
    }, {
      name: 'beta',
      key: {
        tag: 'beta',
        value: 'beta'
      }
    }]
    const expectedMergedArray = [{
      name: 'alpha',
      key: {
        tag: 'alpha-new',
        value: 'alpha-new'
      }
    }, {
      name: 'beta',
      key: {
        tag: 'beta',
        value: 'beta'
      }
    }]
    expect(mergeObjectArraysByUniqueKey(oldArray, newArray)).toStrictEqual(expectedMergedArray)
  })
})
