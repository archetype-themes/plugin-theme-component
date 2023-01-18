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
- Optionally use Sass preprocessor for your CSS
- Use postCSS post-processing for your CSS to assemble everything in a single file.

## Prerequisites

Archie was designed to be used in conjunction with recent yarn versions, version 3.3 at the time of this writing. Its
behaviour with npm and npx commands is untested and is not recommended at the time.

- [Setup Guide](docs/Setup.md)

## Archie Components

Archie helps with multiple components: Collections, Sections & Snippets, and Themes.

With Archie, you can easily create and maintain a Collection of Sections to share amongst your Themes. Collections are
structured as a NodeJS Monorepo of child repositories consisting of Sections and Snippets in their respective
workspaces.

### Please read the following guides to help you on your journey

#### Collection Guides

- [Create your own Collection](docs/Creating-a-Collection.md)
- [User's Guide](docs/Using-a-Collection.md)

#### Sections & Snippets Guides

- [User's Guide](docs/Sections.md)

#### Theme Guides

- [Using a Collection with your Theme.](docs/Themes.md)

#### Technical Guides

- [Understanding the Build Process](docs/Build-process.md)

## Install Archie

This is a shortcut command to install Archie, but contextual use of this is provided in the guide links above.

```shell
# Defaults to the latest version
yarn add @archetype-themes/archie@archetype-themes/archie --dev

# Install a specific version (use a tag, a commit, or a head)
yarn add @archetype-themes/archie@archetype-themes/archie#1.0.1 --dev
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
yarn archie build section --verbose
```

```shell
# Show only Error messages
yarn build-section --quiet
```

## Limitations Being Worked On

* Installing a Collection to a Theme, requires that the Theme be in a hardcoded "src" sub-folder.
* Collections must be part of the  *@archetype-themes* namespace. Upon Theme Install, the namespace *@archetype-themes*
  is Hardcoded when searching for collections in *node_modules* folder.
* Installing multiple collections in a theme is not handled at the moment.

## Contributing

Please read our [Contributing Guide](docs/Contributing.md) for details.
