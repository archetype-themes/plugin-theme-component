export class Template {
  /** @type {string} **/
  name

  /** @type {string} **/
  file

  /** @type {string} **/
  liquidCode

  /** @type {string[]} **/
  snippetNames

  /** @type {Snippet[]} **/
  snippets = []
}