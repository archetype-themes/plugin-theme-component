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
* [`shopify theme component dev [COMPONENT]`](#shopify-theme-component-dev-component)
* [`shopify theme component install`](#shopify-theme-component-install)

## `shopify theme component`

Theme Component Plugin—By Archetype Themes

```
USAGE
  $ shopify theme component [-v]

FLAGS
  -v, --version  Display Plugin Version

DESCRIPTION
  Theme Component Plugin - By Archetype Themes
```

_See code: [plugin/commands/theme/component/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v2.3.0/plugin/commands/theme/component/index.js)_

## `shopify theme component dev [COMPONENT]`

Develop a component in isolation or all available components

```
USAGE
  $ shopify theme component dev [COMPONENT] [--debug] [--trace]

ARGUMENTS
  COMPONENT  Component to develop

FLAGS
  --debug  Debug Mode is more verbose.
  --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Develop a component in isolation or all available components
```

_See code: [plugin/commands/theme/component/dev.js](https://github.com/archetype-themes/plugin-theme-component/blob/v2.3.0/plugin/commands/theme/component/dev.js)_

## `shopify theme component install`

Install a collection of components

```
USAGE
  $ shopify theme component install [--debug] [--trace] [-w]

FLAGS
  -w, --watch  Watch for changes
      --debug  Debug Mode is more verbose.
      --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Install a collection of components
```

_See code: [plugin/commands/theme/component/install.js](https://github.com/archetype-themes/plugin-theme-component/blob/v2.3.0/plugin/commands/theme/component/install.js)_
<!-- commandsstop -->

# Development

For normal development, the initial setup is:

```sh
$ npm i
$ shopify plugins link
```
