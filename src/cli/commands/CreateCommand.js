import ComponentGenerator from '../../generators/ComponentGenerator.js'
import Components from '../../config/Components.js'

class CreateCommand {
  static async execute (commandOption, targetComponent) {
    if ([Components.SECTION_COMPONENT_NAME, Components.SNIPPET_COMPONENT_NAME].includes(commandOption)) {
      await ComponentGenerator.generate(targetComponent, commandOption)
    }
  }
}

export default CreateCommand
