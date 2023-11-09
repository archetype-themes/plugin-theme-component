# Shopify CLI Theme Components Plugin

The Shopify CLI Theme Component Plugin is an extension of the [Shopify CLI](https://github.com/Shopify/cli) that introduces Theme Components to the Shopify Theme development workflow. You can find out more about Theme Components and their benefits in the [archetype-themes/components](https://github.com/archetype-themes/components) repo.

**Main Benefits**

- Theme component development environment to create, test, and preview components in isolation
- Centralizes the presentation layer of your themes into reusuable components
- Manages shared Liquid, JS, CSS, and Locales dependencies
- Outputs individual or collections of components into vanilla theme files, e.g. `snippets`, `assets`, and `locales` that can be copied into your theme project
- Automatic generation of Import Maps to allow for simple, buildless JS projects
- PostCSS for your css to remove duplicatation across components and to assemble everything in a single file.

## Installation

Once you have [Shopify CLI installed](https://shopify.dev/docs/themes/tools/cli/install), install the plugin using:

```shell
shopify plugins:install theme-components-plugin
```

## CLI Commands

```shell
##### Collection Commands #####
shopify theme component dev

shopify theme component build
shopify theme component build --watch
shopify theme component build [component-name]
shopify theme component build [component-name] --watch

shopify theme component create [component-name]

##### Theme Commands #####
shopify theme component install
shopify theme component install --watch
shopify theme component install --latest
shopify theme component install [component-name]
shopify theme component install [component-name@1.3.4]
```

### Watch Flag

Using the watch flag, `--watch` or`-w`, will make the CLI keep an eye on source folders and refresh your build/install
on any source file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

### Log Level

The CLI has a three levels log system, using the standard `info`, `debug`, `error` categories. `info` is the default
level. To use a different log level, use the following flags when running the builder command:

* `--verbose` will activate `debug` log level and a great number of details on internal processes will be
  displayed.
* `--quiet` will activate `error` log level. Only errors will be displayed.

```shell
# Show Error, Info and Debug messages
npx archie build --verbose
```

```shell
# Show only Error messages
npx archie build --quiet
```

### Guides

#### Collection Guides

- [Create a Collection](docs/Creating-a-Collection.md)
- [Growing Your Collection](docs/Growing-Your-Collection.md)

#### Snippet Components Guide

- [Snippet Components](docs/Snippet-Components.md)

#### Theme Guides

- [Theme Integration](docs/Themes.md)

#### Technical Guides

- Understanding the [Build Process](docs/Build-process.md)

## Current Limitations

* [Issue 21](https://github.com/archetype-themes/archie/issues/21): Collections must be part of the  *@archetype-themes*
  namespace. Upon Theme Install, the namespace *@archetype-themes*
  is Hardcoded when searching for collections in *node_modules* folder.
* [Issue 34](https://github.com/archetype-themes/archie/issues/34): Installing multiple collections in a theme is not
  handled at the moment.

## Contributing

Please read our [Contributing Guide](docs/Contributing.md) for details.
