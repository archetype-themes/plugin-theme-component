# plugin-theme-component

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Static Badge](https://img.shields.io/badge/Node.js-v18.12.0-blue)

Shopify CLI plugin for building theme components.

## Install

### Requirements

**MacOS**

- Please install [Homebrew](https://brew.sh/)
- Use Homebrew to [install shopify CLI](https://shopify.dev/docs/themes/tools/cli/install#macos)

### Link the plugin

- Clone this repo
- Run `npm ci` in this repository's folder
- Run `shopify plugins link` to link the plugin

### Update the plugin

- Run `git pull` to update sources
- Run `npm ci` to update dependencies

### Unlink the plugin

- Run `shopify plugins uninstall plugin-theme-component` to link the plugin

# Commands

<!-- commands -->
* [`shopify theme component`](#shopify-theme-component)
* [`shopify theme component dev [COMPONENTS]`](#shopify-theme-component-dev-components)
* [`shopify theme component generate COMPONENTS`](#shopify-theme-component-generate-components)
* [`shopify theme component install [COMPONENTS]`](#shopify-theme-component-install-components)

## `shopify theme component`

Theme Component Plugin - By Archetype Themes

```
USAGE
  $ shopify theme component [-v]

FLAGS
  -v, --version  Display Plugin Version

DESCRIPTION
  Theme Component Plugin - By Archetype Themes
```

_See code: [src/commands/theme/component/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.1.1/src/commands/theme/component/index.js)_

## `shopify theme component dev [COMPONENTS]`

Develop using theme components

```
USAGE
  $ shopify theme component dev [COMPONENTS] [--debug] [--trace] [-t <value>] [-l <value>] [-s] [-w]

ARGUMENTS
  COMPONENTS  Component name(s)

FLAGS
  -s, --[no-]setup-files  Copy Setup Files
  -w, --[no-]watch        Watch For Changes

PATH FLAGS
  -l, --locales-path=<path-or-github-url>  [default: https://github.com/archetype-themes/locales.git] Path to your
                                           locales data
  -t, --theme-path=<path-or-github-url>    [default: https://github.com/archetype-themes/explorer.git] Path to your
                                           theme

DEBUG FLAGS
  --debug  Debug Mode is more verbose.
  --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Develop using theme components

FLAG DESCRIPTIONS
  -l, --locales-path=<path-or-github-url>  Path to your locales data

    The path to your locales data should point to a GitHub URL or a local path. This defaults to Archetype Themes'
    publicly shared locales database.

  -s, --[no-]setup-files  Copy Setup Files

    Installs component setup files in your dev theme to allow component exploration in an isolated environment.

  -t, --theme-path=<path-or-github-url>  Path to your theme

    The path to your theme should point to a GitHub URL or a local path. This defaults to Archetype Themes' publicly
    shared component explorer theme.

  -w, --[no-]watch  Watch For Changes

    Any changes to component, locale of theme source files triggers a file copy and theme build if necessary.
```

_See code: [src/commands/theme/component/dev.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.1.1/src/commands/theme/component/dev.js)_

## `shopify theme component generate COMPONENTS`

Generate canvas files for new components

```
USAGE
  $ shopify theme component generate COMPONENTS [--debug] [--trace]

ARGUMENTS
  COMPONENTS  Component name(s)

DEBUG FLAGS
  --debug  Debug Mode is more verbose.
  --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Generate canvas files for new components
```

_See code: [src/commands/theme/component/generate.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.1.1/src/commands/theme/component/generate.js)_

## `shopify theme component install [COMPONENTS]`

Install a collection of components

```
USAGE
  $ shopify theme component install [COMPONENTS] [--debug] [--trace] [-c <value>] [-l <value>]

ARGUMENTS
  COMPONENTS  Component name(s)

PATH FLAGS
  -c, --components-path=<path-or-github-url>  [default: https://github.com/archetype-themes/components.git] Path to your
                                              components
  -l, --locales-path=<path-or-github-url>     [default: https://github.com/archetype-themes/locales.git] Path to your
                                              locales data

DEBUG FLAGS
  --debug  Debug Mode is more verbose.
  --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Install a collection of components

FLAG DESCRIPTIONS
  -c, --components-path=<path-or-github-url>  Path to your components

    The path to your components should point to a GitHub URL or a local path. This defaults to Archetype Themes'
    publicly shared reference components.

  -l, --locales-path=<path-or-github-url>  Path to your locales data

    The path to your locales data should point to a GitHub URL or a local path. This defaults to Archetype Themes'
    publicly shared locales database.
```

_See code: [src/commands/theme/component/install.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.1.1/src/commands/theme/component/install.js)_
<!-- commandsstop -->
