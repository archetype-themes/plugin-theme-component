# Theme component plugin

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![Static Badge](https://img.shields.io/badge/Node.js-v18.12.0-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Shopify CLI plugin for building themes with Liquid theme components.

The `plugin-theme-component` repository is a foundational part of the [Archetype Devkit preview](https://github.com/archetype-themes/devkit).

## Getting Started

### Prerequisites

You'll need to ensure you have the following installed on your local development machine:

- Latest version of [Node.js](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/getting-started) (or another package manager of your choice)
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install)

### Installation

Install the Shopify CLI plugin:
```bash
shopify plugins install plugin-theme-component
```


## List of commands

<!-- commands -->

<!-- commandsstop -->

## Contributing

Interested in shaping the future of theme development with us? We welcome you to join our community! Your insights and discussions play a crucial role in our continuous improvement. We encourage you to start [discussions](https://github.com/archetype-themes/devkit/discussions), ask questions, and provide feedback on our component approach.

If you notice a bug, or want to contribute to the codebase, feel free to do so in the form of [creating an issue](https://github.com/archetype-themes/plugin-theme-component/issues/new/choose) or [pull request](https://github.com/archetype-themes/plugin-theme-component/pulls).

### Developing the plugin locally

If you already have the plugin installed via npm, you'll need to [uninstall](#uninstalling-the-plugin) the plugin before being able to develop the plugin locally.

Once this is done, follow these steps to ensure the Shopify CLI is running the local version of the plugin:
- `git clone https://github.com/archetype-themes/plugin-theme-component.git`
- `cd plugin-theme-component`
- `npm i`
- `shopify plugins link`
