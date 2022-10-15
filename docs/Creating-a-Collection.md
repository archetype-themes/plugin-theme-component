# Creating An Archie Collection

An Archie Collection is a NodeJS Monorepo that regroups multiple Shopify Theme [Sections](Sections.md) and Snippets in
the form of child repositories in their respective namespaces.

## Prerequisites

Please make sure you have followed the [Setup Guide](Setup.md)

## Creating an Archie Collection

### Node Package Creation

We will start by creating a NodeJS Package.

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

## Using your Collection

Next up, what can we do with this... Collection? Follow the guide:

[Using a Collection](Using-a-Collection.md)
