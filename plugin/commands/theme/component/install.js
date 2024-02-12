import InstallCommand from '../../../../src/commands/InstallCommand.js'
import { BaseCommand } from '../../../baseCommand.js'
import { getTomlConfig } from '../../../../src/utils/TomlUtils.js'
import { sessionFactory } from '../../../../src/factory/SessionFactory.js'

export default class Install extends BaseCommand {
  static description = 'Install a collection of components'

  async run () {
    const tomlConfig = await getTomlConfig()
    sessionFactory(this.id, tomlConfig)

    return InstallCommand.execute()
  }
}
