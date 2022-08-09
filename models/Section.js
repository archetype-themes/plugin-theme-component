import Snippet from './Snippet.js'

class Section extends Snippet {
  constructor () {
    super()
    this.snippetFiles = []
  }

  get schemaFile () {
    return this._schemaFile
  }

  set schemaFile (schemaFile) {
    this._schemaFile = schemaFile
  }

  get snippetFiles () {
    return this._snippetFiles
  }

  set snippetFiles (snippetFiles) {
    this._snippetFiles = snippetFiles
  }

}

export default Section