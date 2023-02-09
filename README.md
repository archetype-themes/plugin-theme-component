# Archie

Archie is Archetype's CLI (Command Line Interface). Archie is designed to segment and structure code in a way to help
Shopify Theme development. Archie helps manage Collections of Sections that easily be integrated with any Shopify Theme.
This reduces code duplication and eases the burden of theme maintenance.

## Prerequisites

NodeJS needs to be installed, please follow the setup guide if needed.

- [Setup Guide](docs/Setup.md)

## Archie Components

Archie helps with multiple components: Collections, Sections & Snippets, and Themes.

With Archie, you can easily create and maintain a Collection of Sections to share amongst your themes. Collections are
structured as a NodeJS Monorepo of child repositories consisting of Sections and snippet in their respective workspaces.

Please read the following guides to help you on your journey:

- Collections
  - [Create your own Collection](docs/Creating-a-Collection.md)
  - [User's Guide](docs/Using-a-Collection.md)
- Sections & Snippets
  - [User's Guide](docs/Sections.md)
- Themes
  - [Using a Collection with your Theme.](docs/Themes.md)
- Technical Guides
  - [Understanding the Build Process](docs/Build-process.md)

## Install Archie

This is a shortcut command to install Archie, but contextual use of this is provided in the guide links above.

```shell
# Defaults to the latest version
npm install @archetype-themes/archie@archetype-themes/archie --save-dev

# Install a specific version (use a tag, a commit, or a head)
npm install @archetype-themes/archie@archetype-themes/archie#1.0.1 --save-dev
```

## Archie Commands

```shell
##### Collection Commands #####
archie build collection
archie build collection --watch
archie build section [section-name]
archie build section [section-name] --watch

archie create section [section-name]
archie create snippet [snippet-name]

##### Section Commands #####
archie build section
archie build section --watch

##### Theme Commands #####
archie install [name-of-collection]
archie install [name-of-collection] --watch


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
npx archie build section --verbose
```

```shell
# Show only Error messages
npx build-section --quiet
```

## Current Limitations

* No Stylesheet Merge or optimisation is being performed.
* Installing multiple collections in a theme is not handled at the moment.

## Contributing

Please read our [Contributing Guide](docs/Contributing.md) for details.
