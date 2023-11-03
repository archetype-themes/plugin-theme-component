class SnippetUtils {
  /**
   * Get Components' Snippet Names
   * @param {(Component|Snippet)[]} components
   * @returns {*[]}
   */
  static getSnippetNames (components) {
    const componentsWithSnippetNames = components.filter(component => component.snippetNames?.length)
    const snippetNames = (componentsWithSnippetNames.map(component => component.snippetNames)).flat()

    return [...new Set(snippetNames)]
  }
}

export default SnippetUtils
