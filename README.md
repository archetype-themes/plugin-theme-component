# Archie

Archie is Archetype's CLI (Command Line Interface). Archie is designed to facilitate Shopify Theme development by making
it fast and easy to populate and maintain Themes with tons of Sections.

Gone are the days of manually copying sections from one theme to another, Archie allows you to create a shareable
Collection of Sections that we bundle as an NPM package. Simply add the dependency to install them within your Shopify
Themes.

**Main Benefits**

- Bundle as many Sections and Snippets as you want within your Collection.
- Share common JavaScript and Styles with your Sections
- Say *"goodbye"* to duplicated code by sharing your Collection with as many Themes as you want
- Configure your Theme to use all or a selection of Sections within a Collection
- Fix your bug once; in the collection repository.
  - Update the Collection dependency in your Themes repository.
- Javascript processing through esbuild will assemble everything in a single file.
- Use postCSS post-processing for your CSS to assemble everything in a single file.

## Prerequisites

Node.js needs to be installed, please follow the setup guide if needed.

- [Setup Guide](docs/Setup.md)

You need to authenticate to GitHub Packages Repository before you can install Archie and Collections.

- [GitHub Package Repository](https://github.com/archetype-themes/.github-private/blob/main/Github-Package-Repository.md)

## Archie Components

Archie helps with multiple components: Collections, Sections & Snippets, and Themes.

With Archie, you can easily create and maintain a Collection of Sections to share amongst your Themes. Collections are
structured as a Node.js Monorepo of child repositories consisting of Sections and Snippets and shared elements in their
respective workspaces.

### Please read the following guides to help you on your journey

#### Collection Guides

- [Create a Collection](docs/Creating-a-Collection.md)
- [Using a Collection](docs/Using-a-Collection.md)

#### Sections & Snippets Guide

- [Sections & Snippets Components](docs/Sections-and-Snippets.md)

#### Theme Guides

- Using a Collection with your [Theme](docs/Themes.md)

#### Technical Guides

- Understanding the [Build Process](docs/Build-process.md)

## Install Archie

This is a shortcut command to install Archie, but contextual use of this is provided in the guide links above.

```shell
# Defaults to the latest version
npm install @archetype-themes/archie --save-dev

# Install a specific version
npm install @archetype-themes/archie#1.0.1 --save-dev

```

Available versions are listed on the
official [archie NPM package page](https://github.com/archetype-themes/archie/pkgs/npm/archie)

## Archie Commands

```shell
##### Collection Commands #####
npx archie build
npx archie build --watch
npx archie build section [section-name]
npx archie build section [section-name] --watch

npx archie create section [section-name]
npx archie create snippet [snippet-name]

##### Section Commands #####
npx archie build
npx archie build --watch

##### Theme Commands #####
npx archie install
npx archie install --watch
```

### Watch Flag

Using the watch flag, `--watch` or`-w`, will keep Archie running. Archie will monitor source folders and refresh your
build/install on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

### Log Level

Archie has a three levels log system, using the standard `info`, `debug`, `error` categories. `info` is the default
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

## Current Limitations

* [Issue 20](https://github.com/archetype-themes/archie/issues/20): Installing a Collection to a Theme, requires that
  the Theme be in a hardcoded "src" sub-folder.
* [Issue 21](https://github.com/archetype-themes/archie/issues/21): Collections must be part of the  *@archetype-themes*
  namespace. Upon Theme Install, the namespace *@archetype-themes*
  is Hardcoded when searching for collections in *node_modules* folder.
* [Issue 33](https://github.com/archetype-themes/archie/issues/33): Section Schema must be in an external JSON file. Any
  section schema json in a liquid file is ignored.
* [Issue 34](https://github.com/archetype-themes/archie/issues/34): Installing multiple collections in a theme is not
  handled at the moment.

## Contributing

Please read our [Contributing Guide](docs/Contributing.md) for details.
