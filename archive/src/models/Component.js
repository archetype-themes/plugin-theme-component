class Component {
  /** @type {string} **/
  name

  /** @type {string} **/
  rootFolder

  /** @type {ComponentFiles} **/
  files

  /** @type {ComponentBuild} **/
  build

  /** @type {string} **/
  liquidCode

  /** @type {string[]} **/
  snippetNames

  /** @type {Snippet[]} **/
  snippets = []
}

export default Component
