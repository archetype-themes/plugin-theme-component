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

## Development workflow

All plugin commands are [listed below](#list-of-commands) and you can learn more about [developing themes with components](https://github.com/archetype-themes/devkit/blob/main/1.%20Getting%20Started/d.%20Developing%20themes%20with%20components.md). In simple terms though, the development workflow is typically done in 3 different stages all using the plugin's commands:

### Creating components

You can create a new component with the `shopify theme component generate` command. This will generate a new theme component in the `components` directory with boilerplate code.

### Developing components

When developing a theme component, you have two separate workflows to choose from. You can either develop theme components:

- **Inside the [component explorer](#)**: the `shopify theme component dev` command launches the component explorer and allows you to develop components in isolation.
- **Inside a [Shopify theme](https://github.com/archetype-themes/reference-theme)**: the `shopify theme component dev --theme-path="../reference-theme"` command allows you to develop your components within the context of a specified theme.

### Installing components

You can install a component (or list of components) with the `shopify theme component install` command. This command is only ran within a [Shopify theme](https://github.com/archetype-themes/reference-theme.git), which then imports the latest changes of your components directly into your theme.

## List of commands

<!-- commands -->
* [`component dev [COMPONENTS]`](#component-dev-components)
* [`component generate COMPONENTS`](#component-generate-components)
* [`component install [COMPONENTS]`](#component-install-components)

## `component dev [COMPONENTS]`

Develop using theme components

```
USAGE
  $ component dev [COMPONENTS...] [--debug] [--trace] [-t <value>] [-l <value>] [-s] [-w]

ARGUMENTS
  COMPONENTS...  Component name(s)

FLAGS
  -s, --[no-]setup-files  Copy Setup Files
  -w, --[no-]watch        Watch For Changes

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
```

_See code: [src/commands/dev/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.2.4/src/commands/dev/index.js)_

## `component generate COMPONENTS`

Generate canvas files for new components

```
USAGE
  $ component generate COMPONENTS... [--debug] [--trace]

ARGUMENTS
  COMPONENTS...  Component name(s)

DEBUG FLAGS
  --debug  Debug Mode is more verbose.
  --trace  Trace Mode provides tracing and debug information.

DESCRIPTION
  Generate canvas files for new components
```

_See code: [src/commands/generate/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.2.4/src/commands/generate/index.js)_

## `component install [COMPONENTS]`

Install a collection of components

```
USAGE
  $ component install [COMPONENTS...] [--debug] [--trace] [-c <value>] [-l <value>]

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

_See code: [src/commands/install/index.js](https://github.com/archetype-themes/plugin-theme-component/blob/v3.2.4/src/commands/install/index.js)_
<!-- commandsstop -->

## Contributing

Interested in shaping the future of theme development with us? We welcome you to join our community! Your insights and discussions play a crucial role in our continuous improvement. We encourage you to start [discussions](https://github.com/archetype-themes/devkit/discussions), ask questions, and provide feedback on our component approach.

If you notice a bug, or want to contribute to the codebase, feel free to do so in the form of [creating an issue](https://github.com/archetype-themes/plugin-theme-component/issues/new/choose) or [pull request](https://github.com/archetype-themes/plugin-theme-component/pulls).

### Developing the plugin locally

If you already have the plugin installed via npm, you'll need to [uninstall](#uninstalling-the-plugin) the plugin before being able to develop the plugin locally.

Once this is done, follow these list of steps to ensure the Shopify CLI is running the local version of the plugin:
- `git clone https://github.com/archetype-themes/plugin-theme-component.git`
- `cd plugin-theme-component`
- `npm ci`
- `shopify plugins link`
