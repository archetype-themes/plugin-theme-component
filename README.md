# @archetype-themes/archie

Shopify CLI plugin for building theme components.

<!-- toc -->
* [@archetype-themes/archie](#archetype-themesarchie)
* [Commands](#commands)
* [Development](#development)
<!-- tocstop -->

# Commands

<!-- commands -->
* [`shopify theme component build [COMPONENT]`](#shopify-theme-component-build-component)
* [`shopify theme component dev [COMPONENT]`](#shopify-theme-component-dev-component)
* [`shopify theme component generate COMPONENT`](#shopify-theme-component-generate-component)
* [`shopify theme component install`](#shopify-theme-component-install)

## `shopify theme component build [COMPONENT]`

Build a component or collection of components

```
USAGE
  $ shopify theme component build [COMPONENT] [-w]

ARGUMENTS
  COMPONENT  Component to build

FLAGS
  -w, --watch  Watch for changes

DESCRIPTION
  Build a component or collection of components
```

_See code: [plugin/commands/theme/component/build.js](https://github.com/archetype-themes/archie/blob/v1.9.7/plugin/commands/theme/component/build.js)_

## `shopify theme component dev [COMPONENT]`

Develop a component in isolation or all components

```
USAGE
  $ shopify theme component dev [COMPONENT]

ARGUMENTS
  COMPONENT  Component to develop

DESCRIPTION
  Develop a component in isolation or all components
```

_See code: [plugin/commands/theme/component/dev.js](https://github.com/archetype-themes/archie/blob/v1.9.7/plugin/commands/theme/component/dev.js)_

## `shopify theme component generate COMPONENT`

Generate a component

```
USAGE
  $ shopify theme component generate COMPONENT

ARGUMENTS
  COMPONENT  Component to generate

DESCRIPTION
  Generate a component
```

_See code: [plugin/commands/theme/component/generate.js](https://github.com/archetype-themes/archie/blob/v1.9.7/plugin/commands/theme/component/generate.js)_

## `shopify theme component install`

Install a collection of components

```
USAGE
  $ shopify theme component install

DESCRIPTION
  Install a collection of components
```

_See code: [plugin/commands/theme/component/install.js](https://github.com/archetype-themes/archie/blob/v1.9.7/plugin/commands/theme/component/install.js)_
<!-- commandsstop -->

# Development

For normal development, the initial setup is:

```sh
$ npm i
$ shopify plugins link
```
