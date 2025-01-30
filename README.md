# Theme component plugin

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![Static Badge](https://img.shields.io/badge/Node.js-v18.12.0-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Shopify CLI plugin for building themes with Liquid theme components.

The `plugin-devkit` repository is a foundational part of the [Archetype Devkit preview](https://github.com/archetype-themes/devkit).

## Getting Started

### Prerequisites

You'll need to ensure you have the following installed on your local development machine:

- Latest version of [Node.js](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/getting-started) (or another package manager of your choice)
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install)

### Installation

Install the Shopify CLI plugin:

```bash
shopify plugins install plugin-devkit
```

## List of commands

<!-- commands -->

- [`shopify theme component`](#shopify-theme-component)
- [`shopify theme component clean [THEMEDIR]`](#shopify-theme-component-clean-themedir)
- [`shopify theme component copy THEMEDIR`](#shopify-theme-component-copy-themedir)
- [`shopify theme component dev [COMPONENTSELECTOR]`](#shopify-theme-component-dev-componentselector)
- [`shopify theme component install THEMEDIR [COMPONENTSELECTOR]`](#shopify-theme-component-install-themedir-componentselector)
- [`shopify theme component map THEMEDIR [COMPONENTSELECTOR]`](#shopify-theme-component-map-themedir-componentselector)
- [`shopify theme generate import-map [THEMEDIR]`](#shopify-theme-generate-import-map-themedir)
- [`shopify theme generate template-map [THEMEDIR]`](#shopify-theme-generate-template-map-themedir)

## `shopify theme component`

Theme Component Plugin by Archetype Themes

```
USAGE
  $ shopify theme component [-v]

FLAGS
  -v, --version  Display Plugin Version

DESCRIPTION
  Theme Component Plugin by Archetype Themes
```

_See code: [src/commands/theme/component/index.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/component/index.ts)_

## `shopify theme component clean [THEMEDIR]`

Remove unused component files in a theme

```
USAGE
  $ shopify theme component clean [THEMEDIR] [-q]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -q, --[no-]quiet  suppress non-essential output

DESCRIPTION
  Remove unused component files in a theme

EXAMPLES
  $ shopify theme component clean theme-directory
```

_See code: [src/commands/theme/component/clean.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/component/clean.ts)_

## `shopify theme component copy THEMEDIR`

Copy files from a component collection into a theme

```
USAGE
  $ shopify theme component copy THEMEDIR [-n <value>] [-v <value>]

ARGUMENTS
  THEMEDIR  path to theme directory

FLAGS
  -n, --collection-name=<value>     name of the component collection
  -v, --collection-version=<value>  version of the component collection

DESCRIPTION
  Copy files from a component collection into a theme

EXAMPLES
  $ shopify theme component copy theme-directory
```

_See code: [src/commands/theme/component/copy.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/component/copy.ts)_

## `shopify theme component dev [COMPONENTSELECTOR]`

Start a sandboxed development environment for components

```
USAGE
  $ shopify theme component dev [COMPONENTSELECTOR] [-n <value>] [-v <value>] [-t <value>] [-s] [-w] [-y] [-i] [-m]
    [--host <value>] [--live-reload] [--port <value>] [--store-password <value>] [--theme <value>] [--store <value>]
    [--environment <value>] [--password <value>]

ARGUMENTS
  COMPONENTSELECTOR  [default: *] component name or names (comma-separated) or "*" for all components

FLAGS
  -i, --generate-import-map         generate import map
  -m, --generate-template-map       generate template map
  -n, --collection-name=<value>     name of the component collection
  -s, --setup-files                 copy setup files to theme directory
  -t, --theme-dir=<value>           [default: https://github.com/archetype-themes/explorer] directory that contains
                                    theme files for development
  -v, --collection-version=<value>  version of the component collection
  -w, --[no-]watch                  watch for changes in theme and component directories
  -y, --[no-]preview                sync changes to theme directory
      --environment=<value>         The environment to apply to the current command.
      --host=<value>                Set which network interface the web server listens on. The default value is
                                    127.0.0.1.
      --live-reload                 Reload the browser when changes are made.
      --password=<value>            Password generated from the Theme Access app.
      --port=<value>                Local port to serve theme preview from.
      --store=<value>               Store URL. It can be the store prefix (example.myshopify.com) or the complete URL.
      --store-password=<value>      The password for storefronts with password protection.
      --theme=<value>               Theme ID or name of the remote theme.

DESCRIPTION
  Start a sandboxed development environment for components

EXAMPLES
  $ shopify theme component dev

  $ shopify theme component dev header

  $ shopify theme component dev header,footer,navigation
```

_See code: [src/commands/theme/component/dev.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/component/dev.ts)_

## `shopify theme component install THEMEDIR [COMPONENTSELECTOR]`

Runs the map, copy, clean, and generate import-map commands in sequence

```
USAGE
  $ shopify theme component install THEMEDIR [COMPONENTSELECTOR] [-n <value>] [-v <value>]

ARGUMENTS
  THEMEDIR           path to theme directory
  COMPONENTSELECTOR  [default: *] component name or names (comma-separated) or "*" for all components

FLAGS
  -n, --collection-name=<value>     name of the component collection
  -v, --collection-version=<value>  version of the component collection

DESCRIPTION
  Runs the map, copy, clean, and generate import-map commands in sequence

EXAMPLES
  $ shopify theme component install theme-directory

  $ shopify theme component install theme-directory header

  $ shopify theme component install theme-directory header,footer,navigation
```

_See code: [src/commands/theme/component/install.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/component/install.ts)_

## `shopify theme component map THEMEDIR [COMPONENTSELECTOR]`

Generates or updates a component.manifest.json file with the component collection details and a file map

```
USAGE
  $ shopify theme component map THEMEDIR [COMPONENTSELECTOR] [-n <value>] [-v <value>] [-f] [-o]

ARGUMENTS
  THEMEDIR           path to theme directory
  COMPONENTSELECTOR  [default: *] component name or names (comma-separated) or "*" for all components

FLAGS
  -f, --ignore-conflicts            ignore conflicts when mapping components
  -n, --collection-name=<value>     name of the component collection
  -o, --ignore-overrides            ignore overrides when mapping components
  -v, --collection-version=<value>  version of the component collection

DESCRIPTION
  Generates or updates a component.manifest.json file with the component collection details and a file map

EXAMPLES
  $ shopify theme component map theme-directory

  $ shopify theme component map theme-directory header

  $ shopify theme component map theme-directory header,footer,navigation
```

_See code: [src/commands/theme/component/map.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/component/map.ts)_

## `shopify theme generate import-map [THEMEDIR]`

Generate an import map for JavaScript files in the assets directory

```
USAGE
  $ shopify theme generate import-map [THEMEDIR] [-q]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -q, --[no-]quiet  suppress non-essential output

DESCRIPTION
  Generate an import map for JavaScript files in the assets directory
```

_See code: [src/commands/theme/generate/import-map.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/generate/import-map.ts)_

## `shopify theme generate template-map [THEMEDIR]`

Generate a template map for component routes in the templates directory

```
USAGE
  $ shopify theme generate template-map [THEMEDIR] [-q]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -q, --[no-]quiet  suppress non-essential output

DESCRIPTION
  Generate a template map for component routes in the templates directory
```

_See code: [src/commands/theme/generate/template-map.ts](https://github.com/archetype-themes/plugin-devkit/blob/v5.0.3/src/commands/theme/generate/template-map.ts)_

<!-- commandsstop -->

## Contributing

Interested in shaping the future of theme development with us? We welcome you to join our community! Your insights and discussions play a crucial role in our continuous improvement. We encourage you to start [discussions](https://github.com/archetype-themes/devkit/discussions), ask questions, and provide feedback on our component approach.

If you notice a bug, or want to contribute to the codebase, feel free to do so in the form of [creating an issue](https://github.com/archetype-themes/plugin-devkit/issues/new/choose) or [pull request](https://github.com/archetype-themes/plugin-devkit/pulls).

### Developing the plugin locally

If you already have the plugin installed via npm, you'll need to [uninstall](#uninstalling-the-plugin) the plugin before being able to develop the plugin locally.

Once this is done, follow these steps to ensure the Shopify CLI is running the local version of the plugin:

- `git clone https://github.com/archetype-themes/plugin-devkit.git`
- `cd plugin-devkit`
- `npm i`
- `npm run watch` or `npm run build`
- `shopify plugins link`
