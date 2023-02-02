import SectionGenerator from '../../generators/SectionGenerator.js'
import SnippetGenerator from '../../generators/SnippetGenerator.js'
import Components from '../../config/Components.js'

class CreateCommand {
  static async execute (commandOption, targetComponent) {
    if (commandOption === Components.SECTION_COMPONENT_NAME) {
      await SectionGenerator.generate(targetComponent)
    }
    if (commandOption === Components.SNIPPET_COMPONENT_NAME) {
      await SnippetGenerator.generate(targetComponent)
    }
  }
}

export default CreateCommand
