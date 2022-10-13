- [Archie Collections](#archie-collections)
    * [Prerequisites](#prerequisites)
    * [Creating an Archie Collection](#creating-an-archie-collection)
        + [Node Package Creation](#node-package-creation)
        + [Node Package Configuration](#node-package-configuration)
        + [Installing Archie](#installing-archie)
            - [Let's kick shell!](#lets-kick-shell)
    * [Using your Collection](#using-your-collection)

# Archie Collections

An Archie Collection is an amalgamation of [Sections](Sections.md) and Snippets. Since they can be installed within any
Shopify theme, their structure greatly helps avoid code duplication when sharing sections amongst multiple themes.

## Prerequisites

Archie was designed to be used in conjunction with recent yarn versions, version 3.3 at the time of this writing. Its
behaviour with npm and npx commands is untested and is not recommended at the time.

Please make sure your node and yarn versions are up-to-date by following the [Setup Guide](Setup.md)

## Creating an Archie Collection

An Archie Collection is a yarn monorepo that contains multiple child elements, be it Sections or Snippets.

We will start by creating a Node JS Package.

### Node Package Creation

```shell
# Save your collection name
collection="my-awesome-collection"

# Create and enter its folder
mkdir $collection && cd $collection

# Create the node package and configure its nodeLinker param to be npm compatible
yarn init -2
yarn config set nodeLinker node-modules
```

### Node Package Configuration

Next, you will need to edit your package.json.

```json
{
  "name": "my-awesome-collection",
  "packageManager": "yarn@3.2.4",
  "archie": {
    "componentType": "collection"
  },
  "workspaces": [
    "sections/*",
    "snippets/*"
  ]
}
```

- Adding the **archie** group with the **"collection"** component type identifies your package as a collection monorepo
  for Archie.
- Adding the **workspaces** group indicates that this is a monorepo with multiples child modules that can be found in
  the **"sections"** or **"snippets"** sub-folders.

### Installing Archie

Now, let's set Archie as a dependency.

```shell
yarn add archie@archetype-themes/archie --dev --peer
```

- It is a dev dependency and a peer dev dependency to any Theme installing your collection.
- It is private package fetched through GitHub. Therefore, authentication to @archetype-themes is required.

Once installed, the following command will be available:

```shell
yarn archie
```

#### Let's kick shell!

I strongly recommend creating a helper shortcut to be able to use just plain "archie". Edit your .zshrc file and append
this next line at the end. The next examples will assume you did.

```shell
alias archie='yarn archie'
```

To apply the newly created shortcut, you can reload your .zshrc using the "source" command, or open a new console.

```shell
# Reloading .zshrc file with "source" command
source ~/.zshrc
```

## Using your Collection

Next up, what can we do with this... Collection? Follow the guide:

[Using a Collection](Using-a-Collection.md)
