import Collection from '../../models/Collection.js'
import Section from '../../models/Section.js'
import Snippet from '../../models/Snippet.js'
import SectionGenerator from '../../generators/SectionGenerator.js'
import SnippetGenerator from '../../generators/SnippetGenerator.js'

class CreateCommand {
  static NAME = 'create'
  static ENABLED_COMPONENTS = [Collection.COMPONENT_NAME]
  static AVAILABLE_OPTIONS = [Section.COMPONENT_NAME, Snippet.COMPONENT_NAME]

  static async execute (commandOption, targetComponent) {
    if (commandOption === Section.COMPONENT_NAME) {
      await SectionGenerator.generate(targetComponent)
    }
    if (commandOption === Snippet.COMPONENT_NAME) {
      await SnippetGenerator.generate(targetComponent)
    }
  }
}

export default CreateCommand
