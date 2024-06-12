class Theme {
  /** @type {string} **/
  assetsFolder

  /** @type {string} **/
  configFolder

  /** @type {string} **/
  localesFolder

  /** @type {string} **/
  name

  /** @type {string} **/
  rootFolder

  /** @type {Template[]} **/
  templates

  /** @type {Layout[]} **/
  layouts

  /** @type {Section[]} **/
  sections

  /** @type {string} **/
  sectionsFolder

  /** @type {string} **/
  layoutsFolder

  /** @type {string} **/
  templatesFolder

  /** @type {string} **/
  snippetsFolder

  /** @type {Set<string>} **/
  snippetNames
}

export default Theme
