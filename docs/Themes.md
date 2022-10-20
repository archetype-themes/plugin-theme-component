# Archie Themes

Archie Theme is any standard Shopify Theme is a component type used within Archie to define a standard Shopify Theme.
Archie enhances Shopify Themes by
enabling installation of one or more Archie Collections.

## Prerequisites

Please make sure you have followed the [Setup Guide](Setup.md)

## Configuring your theme to use Archie

Using Archie allows you to easily install an "Archie Collection" within your Theme.

### Yarn Configuration

We will start by configuring a recent version of yarn as a package manager

```shell
# Set yarn to its latest stable version
yarn set version stable

# Configure its nodeLinker param to be npm compatible
yarn config set nodeLinker node-modules
```

### Adding a Collection

You need to install Archie along with your Collection, Archie is the tool that will allow you to install the
Collection's code within your theme files.

```shell
# Add Archie
yarn add archie@archetype-themes/archie --dev

# Add a finalized collection from GitHub
yarn add [my-awesome-collection]@archetype-themes/[my-awesome-collection] --dev

# Add your work-in-progress local collection from a local folder (relative or absolute path accepted)
yarn add [my-awesome-collection]@portal:[path/to/my-awesome-collection] --dev
```

### Node Package Configuration

Next, you will need to edit your package.json to add the archie configuration element, at the location of your choice

* Make sure you indicate your componentType as a "theme"
* Optionally include a list of sections from your collection for a partial install

```json
{
  "archie": {
    "componentType": "theme",
    "my-awesome-collection": [
      "section-one",
      "section-two",
      "section-four"
    ]
  }
}
```

### Install your collection

```shell
archie install [my-awesome-collection]
```

this command will build a fresh brew of your collection and install it with your Theme.
Archie will create a backup of all files modified, just in case.

The newly added files should look something like that:

```shell
# Collection Styles
src/assets/[my-awesome-collection].cs
# Collection JavaScript
src/assets/[my-awesome-collection].js

# Collection Sections
src/sections/[section-one].liquid
src/sections/[section-two].liquid

# Collection Snippets (only if invoked as a for loop)
src/snippets/[snippet-one].liquid

```

The following files will be edited or created if need be:

```shell
# Adding JavaScript and Styles references if needed
src/layout/theme.liquid

# Adding/editing Schema locales if needed
src/locales/[some-locale].schema.json
```
