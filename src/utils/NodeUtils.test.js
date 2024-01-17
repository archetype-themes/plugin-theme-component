import { describe, expect, test, vi } from 'vitest'
import NodeUtils from './NodeUtils.js'

vi.mock('process', async () => {
  const process = await vi.importActual('process')
  return {
    ...process,
    argv: [
      '/path/to/bin/node',
      '/path/to/bin/archie',
      'install',
      '--verbose'
    ]
  }
})

describe('getArgs', () => {
  test('CLI install command with filtered verbose argument.', () => {
    expect(NodeUtils.getArgs()).toStrictEqual(['install'])
  })
})
