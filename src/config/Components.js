import { join } from 'node:path'

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
export const CONFIG_FOLDER_NAME = 'config'

/** @type {string} **/
export const LOCALES_FOLDER_NAME = 'locales'

/** @type {string} **/
export const LOCALES_INSTALL_FOLDER = '.locales'

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
export const IMPORT_MAP_SNIPPET_FILENAME = 'import-map.liquid'

export const THEME_LAYOUT_FILE = 'layout/theme.liquid'

export const THEME_INDEX_TEMPLATE_LIQUID_FILE = join(TEMPLATES_FOLDER_NAME, 'index.liquid')
