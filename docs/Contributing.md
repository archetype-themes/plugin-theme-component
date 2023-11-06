# Contributing to Archetype Themes' CLI

All contributions are welcome. To Contribute, simply create a branch, commit your code, and create a pull request.

## Install The CLI

First, checkout the code from [Archie repository](https://github.com/archetype-themes/archie) and make it available
globally as a linkable local package.

```shell

# Link your local install of archie
cd ~/projects
git checkout https://github.com/archetype-themes/archie.git

# Make archie available globally as a linkable local package
cd archie
npm link
```

Then install the CLI within a collection and/or a theme as a local folder dependency. Before doing so, you might have to
remove your standard remote CLI install.

```shell
# Link your repository to your shared archie local copy
cd ~/projects/[collection-repo|theme-repo]
npm link @archetype-themes/archie

# Alternatively If you are in a theme workspace, you might want to use this command instead
npm link @archetype-themes/archie --workspace=[worskspace-folder/workspace-name]
```

**IMPORTANT**

- Please note this does not alter you package.json file, more importantly, your package.json file will always be
  prioritized when running subsequent `npm install` commands in your `[collection-repo|theme-repo]` folder. Therefore,
  if `@archetype-themes/archie` is listed as a dependency in you package.json, it will result in an **OVERWRITE** of
  your previous `npm link @archetype-themes/archie` command and your will need to run it again.

Use the following commands to manage your links:

```shell
# View current repository's links
cd ~/projects/[collection-repo-folder | theme-repo-folder]
npm ls --link

# View your globally linkable repositories
npm ls --link --global

# Unlink archie from your collection or theme repository
cd ~/projects/[collection-repo-folder | theme-repo-folder]
npm unlink @archetype-themes/archie

# Delete the globally available link to your local archie install
cd ~/projects/archie
npm unlink

```

## Contributing To The CLI's Development

You should consult the [Archie Project](https://github.com/orgs/archetype-themes/projects/43) in GitHub. You will see
the cycle plannings. Tickets should list upcoming features and backlog.

Assign yourself a ticket and reach out to us if you have questions. Create a branch for your development. Create a Pull
Request for your code to be merged into the main branch.

## Code Structure

Please follow the guidelines listed below.

### General Structure

```shell
.
├── README.md
├── package.json
└── src
    ├── bin
    │   ├── archie.js   [ archie entrypoint ]
    ├── runners        [ component runners ]
    ├── cli
    │   └── commands    [ CLI commands ]
    │   └── flags        [ CLI command flags ]
    │   └── models      [ CLI models ]
    ├── errors          [ custom errors ]
    ├── factory         [ component factories ]
    ├── generators      [ component generators ]
    ├── installers      [ component installers ]
    ├── models          [ component models ]
    │   └── abstract    [ abstract component models ]
    ├── processors      [ external processors ]
    │   └── postcss     [ external postcss processor ]
    └── utils           [ component utilities ]

```

### Phase 1: Bin & CLI Folder

CLI stands for Command Line Interface

bin/archie.js is the CLI's entrypoint

The CLI Sub-folder should only contain files pertaining to Shell execution and management. It should analyze command
input and call appropriate Factories, Builders and Installers when necessary.

### Phase 2: Factory Folder

Factories create Component instances. When creating a Component instance, a Factory should load all necessary data from
disk expecting a "transformation" for an upcoming Build process.

Factories should load items recursively. If you create a Component using the ComponentFactory, it should create instances
and load data from its children Snippet Model using the SnippetFactory through a recursive check.

- Load all necessary data from disk for upcoming merge and/or transformation done during the Builder step.
- **SHOULD NOT** transform any data.
- **SHOULD NOT** install anything inside Themes or modify Themes in any way.

### Phase 3: Builders Folder

Builders are there to assemble and process file contents in order to deliver a final product.
*This does not relate in any way to the Builder Design Pattern

- Run after Factories have completed Component Model creation.
- Transform data as necessary using external processors, such as esbuild, sass, post-css
- Transform and merge data using internal processors, such as liquid code and locales
- Copy files that do not need transformation to the build folder.
- **SHOULD NOT** load data from disk that needs transformation.
- **SHOULD NOT** install anything inside Themes or modify Themes in any way.

### Phase 4: Installers Folder

Installers are meant to install Collection Builds in a Shopify Theme.

- Run after Factories and Builders have completed their tasks.
- Copy necessary final Build files to a Theme.
- Perform file merge with Theme files when necessary (i.e.: Schema-Locale files)
- **SHOULD NOT** load data from disk that needs transformation.
- **SHOULD NOT** transform any data.

### Errors

Contains custom Internal Errors used within the CLI

### Generators

CLI **create** commands will invoke Generators to help create components within a Collection.
Create commands execution will not run Phase 2,3 and 4

### Models

Data Object models used throughout Phase 2,3 and 4.

### Processors

Processors transform data and should only be called during Phase 3, through Builder methods.

### Utils

Various Utility functions organized inside JavaScript Objects as static methods.

## Fixing Bugs

Check the [bug issues panel](https://github.com/archetype-themes/archie/issues?q=is%3Aopen+is%3Aissue+label%3Abug) to
view current bugs. Assign yourself one and create a branch for your fix. Create a Pull Request for your fix to be
merged into the main branch.
