# Contributing to Archetype Themes' CLI

All contributions are welcome. To Contribute, create a branch, commit your code, and create a pull request.

## Install the plugin

Make sure you have installed the [shopify CLI](https://shopify.dev/docs/api/shopify-cli) first. Then, checkout the code
from the [plugin-devkit repository](https://github.com/archetype-themes/plugin-devkit) and link your
local copy to your shopify CLI instance. Here's an example of what that can look like on macOS

```shell
# Install shopify CLI on macOS using the oclif methods
brew tap shopify/shopify
brew install shopify-cli

# Checkout the repository in you projects folder, or any other location of your choice
cd ~/projects
git checkout https://github.com/archetype-themes/plugin-devkit.git

# Link your local copy to the shopify CLI
cd plugin-devkit
shopify plugins link
```

## Uninstall the plugin

Should you ever need to uninstall the plugin, use these commands

```shell
# From the project folder
cd ~/projects/plugin-devkit
shopify plugins uninstall

# From anywhere
shopify plugins uninstall plugin-devkit
```

## Contributing To The CLI's Development

You should consult the [Issues](https://github.com/archetype-themes/plugin-devkit/issues) in GitHub. You will
see unsolved issues. Feel free to tackle an existing issue, or create a new one if you need to.

Assign yourself an issue and reach out to us if you have questions. Create a branch for your development. Create a Pull
Request for your code to be merged into the main branch.

## Code Structure

Please follow the guidelines listed below.

### General Structure

```shell
.
├── README.md
├── package.json
├── bin                       [ component plugin entrypoints ]
│   ├── run.cmd                 [ CMD entrypoint ]
│   └── run.js                  [ JavaScript entrypoint ]
├── docs                      [ documentation folder ]
├── resources                 [ static resources ]
│   ├── component-files         [ generate component template files ]
│   └── explorer                [ component explorer files ]
├── src
│   ├── builders              [ component builders ]
│   ├── commands
│   │   └── theme
│   │       └── component     [ plugin commands entrypoints ]
│   ├── config                [ plugin configuration ]
│   ├── errors                [ plugin custom errors ]
│   ├── factory               [ component factory methods ]
│   ├── installers            [ component installers ]
│   ├── models                [ data object models ]
│   │   └── abstract            [ abstract data object models ]
│   ├── processors            [ data transformation for CSS, JavaScript and more ]
│   └── utils                 [ Utility methods ]
└── tests                     [ mocha tests ]
```

### bin

Based on oclif CLI's recommended structure, this is the standard entrypoint for a CLI or, in this case, a CLI plugin.

### docs

Contains additional documentation on components and the plugin's structure and build process.

### resources

Contains static assets used internally when generating a new component or when running the plugin's dev command with
setup files enabled.

### src folder

#### factory

Factories create component instances. When instantiating a component, a factory should load all necessary data from disk
preparing grounds for the build process.

Factories load direct descendants automatically.
If you create a Component using the ComponentFactory, it should create instances and load data from its child snippets
using the SnippetFactory.

- Load all necessary data from disk for upcoming merge and/or transformation done during the Builder step.
- **SHOULD NOT** transform any data.
- **SHOULD NOT** install anything inside Themes or modify Themes in any way.

### builders folder

Builders are there to assemble and process file contents to deliver a final product.
\*This does not relate in any way to the Builder Design Pattern

- Should only be run after factories have completed component data model creation.
- Transform data as necessary using external processors, such as post-css
- Transform and merge data using internal processors, such as import-map
- Copy relevant files that do not need transformation to the build folder.
- **SHOULD NOT** load data from the disk that needs transformation.
- **SHOULD NOT** install anything inside Themes or modify Themes in any way.

### installers folder

Installers are meant to install Collection Builds in a Shopify Theme.

- Should only be run after factories and builders have completed their tasks.
- Copy the necessary final Build files to a Theme.
- Perform file merge with Theme files when necessary (i.e.: locale files)
- **SHOULD NOT** load data from the disk that needs transformation.
- **SHOULD NOT** transform any data.

### Errors

Contains custom Internal Errors used within the plugin

### Generators

The plugin's **generate** command will invoke generators to help create new components.

### Models

Shared data object models

### Processors

Processors transform data and should only be called by builders

### Utils

Various utility methods organized by topic.

## Fixing Bugs

Check
the [bug issues panel](https://github.com/archetype-themes/plugin-devkit/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
to view current bugs. Assign yourself one and create a branch for your fix. Create a Pull Request for your fix to be
merged into the main branch.
