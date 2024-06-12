import { join, sep } from 'node:path'

/*********************/
/** COMPONENT TYPES **/
/*********************/

/** @type {string}  **/
export const COLLECTION_TYPE_NAME = 'collection'

/** @type {string}  **/
export const COMPONENT_TYPE_NAME = 'component'

/** @type {string}  **/
export const THEME_TYPE_NAME = 'theme'

/******************/
/** FOLDER NAMES **/
/******************/

/** @type {string} **/
export const ASSETS_FOLDER_NAME = 'assets'

/** @type {string} **/
export const COMPONENTS_FOLDER = 'components'

/** @type {string} **/
export const LAYOUTS_FOLDER = 'layout'

/** @type {string} **/
export const CONFIG_FOLDER_NAME = 'config'

/** @type {string} **/
export const DEV_FOLDER_NAME = '.explorer'

/** @type {string} **/
export const LOCALES_FOLDER_NAME = 'locales'

/** @type {string} **/
export const SECTIONS_FOLDER_NAME = 'sections'

/** @type {string} **/
export const SETUP_FOLDER_NAME = 'setup'

/** @type {string} **/
export const SNIPPETS_FOLDER_NAME = 'snippets'

/** @type {string} **/
export const TEMPLATES_FOLDER_NAME = 'templates'
/******************/
/**  FILE NAMES  **/
/******************/

/** @type {string} **/
export const CONFIG_FILE_NAME = 'shopify.theme.toml'

/** @type {string} **/
export const IMPORT_MAP_SNIPPET_FILENAME = 'import-map.liquid'

export const THEME_LAYOUT_FILE = `layout${sep}theme.liquid`

export const THEME_INDEX_TEMPLATE_LIQUID_FILE = join(TEMPLATES_FOLDER_NAME, 'index.liquid')

/***********************/
/**  FILE EXTENSIONS  **/
/***********************/

/** @type {string}  **/
export const JSON_EXTENSION = '.json'

/** @type {string}  **/
export const LIQUID_EXTENSION = '.liquid'

/** @type {string[]}  **/
export const SCRIPT_EXTENSIONS = ['.js', '.mjs', '.cjs']

/** @type {string[]}  **/
export const STYLE_EXTENSIONS = ['.css']

export const SVG_EXTENSION = '.svg'

/**
 * File Types Enum
 * @type {{Liquid: string, Css: string, Svg: string, Javascript: string}}
 */
export const FileTypes = {
  Css: 'css',
  Javascript: 'javascript',
  Liquid: 'liquid',
  Svg: 'svg'
}
