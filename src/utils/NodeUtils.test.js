import { env } from 'node:process'
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
  test('Archie install command with filtered verbose argument.', () => {
    expect(NodeUtils.getArgs()).toStrictEqual(['install'])
  })
})

describe('getPackageManifest', () => {
  test('Returns package.json as a javascript object when npm_package_json is valid', async () => {
    vi.stubEnv('npm_package_json', new URL('test/sample.package.json', import.meta.url).pathname)
    const packageManifest = await NodeUtils.getPackageManifest()
    expect(packageManifest).toMatchFileSnapshot('./test/sample.package.json.snap')
    vi.unstubAllEnvs()
  })

  test('Throws an Error if env.npm_package_json is missing', () => {
    const npmPackageJson = env.npm_package_json
    delete env.npm_package_json
    expect(() => NodeUtils.getPackageManifest()).rejects.toThrowError()
    env.npm_package_json = npmPackageJson
  })
})

describe('getPackageName', () => {
  test('Returns the package name if both package scope and package name are present', () => {
    vi.stubEnv('npm_package_name', '@some-scope/some-package')
    expect(NodeUtils.getPackageName()).toBe('some-package')
    vi.unstubAllEnvs()
  })

  test('Returns the package name when no package scope is present', () => {
    vi.stubEnv('npm_package_name', 'some-package')
    expect(NodeUtils.getPackageName()).toBe('some-package')
    vi.unstubAllEnvs()
  })

  test('Throws an Error when env.npm_package_name is missing', () => {
    const npmPackageName = env.npm_package_name
    delete env.npm_package_name
    expect(() => NodeUtils.getPackageName()).toThrowError()
    env.npm_package_name = npmPackageName
  })
})

describe('getPackageScope', () => {
  test('Returns the package scope if both package scope and package name are present', () => {
    vi.stubEnv('npm_package_name', '@some-scope/some-package')
    expect(NodeUtils.getPackageScope()).toBe('@some-scope')
    vi.unstubAllEnvs()
  })

  test('Returns an empty string if there is no package scope', () => {
    vi.stubEnv('npm_package_name', 'some-package')
    expect(NodeUtils.getPackageScope()).toBe('')
    vi.unstubAllEnvs()
  })

  test('Throws an Error when env.npm_package_name is missing', () => {
    const npmPackageName = env.npm_package_name
    delete env.npm_package_name
    expect(() => NodeUtils.getPackageScope()).toThrowError()
    env.npm_package_name = npmPackageName
  })
})

describe('getPackageRootFolder', () => {
  test('Returns a valid path based on env.npm_package_json when this env variable is set', () => {
    vi.stubEnv('npm_package_json', new URL('test/sample.package.json', import.meta.url).pathname)
    expect(NodeUtils.getPackageRootFolder()).toMatch(new URL('test', import.meta.url).pathname)
    vi.unstubAllEnvs()
  })

  test('Throws an Error if env.npm_package_json is missing', () => {
    const npmPackageJson = env.npm_package_json
    delete env.npm_package_json
    expect(() => NodeUtils.getPackageRootFolder()).toThrowError()
    env.npm_package_json = npmPackageJson
  })
})

describe('getMonorepoRootFolder', () => {
  test('NPM: If env.npm_config_local_prefix is set, return it.', () => {
    vi.stubEnv('npm_config_local_prefix', '/npm/sample/project/path')
    const projectCwd = env.PROJECT_CWD
    delete env.PROJECT_CWD
    expect(NodeUtils.getMonorepoRootFolder()).toBe('/npm/sample/project/path')
    env.PROJECT_CWD = projectCwd
    vi.unstubAllEnvs()
  })

  test('Yarn: If env.PROJECT_CWD is set, return it.', () => {
    vi.stubEnv('PROJECT_CWD', '/yarn/sample/project/path')
    const npmConfigLocalPrefix = env.npm_config_local_prefix
    delete env.npm_config_local_prefix
    expect(NodeUtils.getMonorepoRootFolder()).toBe('/yarn/sample/project/path')
    env.npm_config_local_prefix = npmConfigLocalPrefix
  })

  test('Throws an Error if both environment variables are missing', () => {
    const npmConfigLocalPrefix = env.npm_config_local_prefix
    const projectCwd = env.PROJECT_CWD
    delete env.npm_config_local_prefix
    delete env.PROJECT_CWD
    expect(() => NodeUtils.getMonorepoRootFolder()).toThrowError()
    env.npm_config_local_prefix = npmConfigLocalPrefix
    env.PROJECT_CWD = projectCwd
  })
})

describe('getArchieRootFolderName', () => {
  test('Get Root Folder from the current file\'s path.', () => {
    expect(NodeUtils.getMonorepoRootFolder()).toBe(process.cwd())
  })
})
