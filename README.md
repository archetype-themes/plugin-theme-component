# Theme component plugin

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![Static Badge](https://img.shields.io/badge/Node.js-v18.12.0-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Shopify CLI plugin for building theme components.

The `plugin-theme-component` repository is a foundational part of the [Archetype Devkit preview](https://github.com/archetype-themes/devkit). It provides commands to create, develop, and install a collection of theme components.

## Getting Started

### Prerequisites

You'll need to ensure you have the following installed on your local development machine:

- Latest version of [Node.js](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/getting-started) (or another package manager of your choice)
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install)

### Installation

Simply run the following command to install the Shopify CLI plugin:
```bash
shopify plugins install plugin-theme-component
```

### Uninstalling the plugin

If you want to uninstall the plugin from the Shopify CLI, you can run the following command:
```bash
shopify plugins uninstall plugin-theme-component
```

## List of commands

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

_See code: [src/commands/theme/component/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.6.1/src/commands/theme/component/index.js)_

## `shopify theme component dev [COMPONENTS]`

Develop using theme components

```
USAGE
  $ shopify theme component dev [COMPONENTS...] [--debug] [--trace] [-t <value>] [-l <value>] [-s] [-w] [--sync]

ARGUMENTS
  COMPONENTS...  Component name(s)

FLAGS
  -s, --[no-]setup-files  Copy Setup Files
  -w, --[no-]watch        Watch For Changes
      --[no-]sync         Sync your files through shopify theme dev

PATH FLAGS
  -l, --locales-path=<path-or-github-url>  [default: https://github.com/archetype-themes/locales.git] Path to your
                                           locales data
  -t, --theme-path=<path-or-github-url>    [default: https://github.com/archetype-themes/reference-theme.git] Path to
                                           your theme

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

  --[no-]sync  Sync your files through shopify theme dev

    This will execute `shopify theme dev --path .explorer` along with your component dev command. You can customize
    options for that command in your toml file.
```

_See code: [src/commands/theme/component/dev.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.6.1/src/commands/theme/component/dev.js)_

## `shopify theme component generate COMPONENTS`

Generate canvas files for new components

```
USAGE
  $ shopify theme component generate COMPONENTS... [--debug] [--trace]

ARGUMENTS
  COMPONENTS...  Component name(s)

DEBUG FLAGS
  --debug  Debug Mode is more verbose.
  --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Generate canvas files for new components
```

_See code: [src/commands/theme/component/generate.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.6.1/src/commands/theme/component/generate.js)_

## `shopify theme component install [COMPONENTS]`

Install a collection of components

```
USAGE
  $ shopify theme component install [COMPONENTS...] [--debug] [--trace] [-c <value>] [-l <value>]

ARGUMENTS
  COMPONENTS...  Component name(s)

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

_See code: [src/commands/theme/component/install.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.6.1/src/commands/theme/component/install.js)_
<!-- commandsstop -->

## Contributing

Interested in shaping the future of theme development with us? We welcome you to join our community! Your insights and discussions play a crucial role in our continuous improvement. We encourage you to start [discussions](https://github.com/archetype-themes/devkit/discussions), ask questions, and provide feedback on our component approach.

If you notice a bug, or want to contribute to the codebase, feel free to do so in the form of [creating an issue](https://github.com/archetype-themes/plugin-theme-component/issues/new/choose) or [pull request](https://github.com/archetype-themes/plugin-theme-component/pulls).

### Developing the plugin locally

If you already have the plugin installed via npm, you'll need to [uninstall](#uninstalling-the-plugin) the plugin before being able to develop the plugin locally.

Once this is done, follow these steps to ensure the Shopify CLI is running the local version of the plugin:
- `git clone https://github.com/archetype-themes/plugin-theme-component.git`
- `cd plugin-theme-component`
- `npm ci`
- `shopify plugins link`
