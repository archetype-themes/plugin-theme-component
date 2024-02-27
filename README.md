# plugin-theme-component

Shopify CLI plugin for building theme components.

<!-- toc -->
* [plugin-theme-component](#plugin-theme-component)
* [Commands](#commands)
* [Development](#development)
<!-- tocstop -->

# Commands

<!-- commands -->
* [`shopify theme component`](#shopify-theme-component)
* [`shopify theme component dev [COMPONENTS]`](#shopify-theme-component-dev-components)
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

_See code: [src/commands/theme/component/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.0.0/src/commands/theme/component/index.js)_

## `shopify theme component dev [COMPONENTS]`

Develop theme components

```
USAGE
  $ shopify theme component dev [COMPONENTS] [--debug] [--trace] [-l <value>] [-t <value>] [-s] [-w]

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
  Develop theme components

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

_See code: [src/commands/theme/component/dev.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.0.0/src/commands/theme/component/dev.js)_

## `shopify theme component install [COMPONENTS]`

Install a collection of components

```
USAGE
  $ shopify theme component install [COMPONENTS] [--debug] [--trace] [-l <value>] [-c <value>]

ARGUMENTS
  COMPONENTS  Component name(s)

PATH FLAGS
  -c, --components-path=<path-or-github-url>  [default: https://github.com/archetype-themes/reference-components.git]
                                              Path to your components
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

_See code: [src/commands/theme/component/install.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.0.0/src/commands/theme/component/install.js)_
<!-- commandsstop -->

# Development

For normal development, the initial setup is:

```sh
$ npm i
$ shopify plugins link
```
