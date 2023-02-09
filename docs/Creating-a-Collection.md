# Creating An Archie Collection

An Archie Collection is a NodeJS Monorepo that regroups multiple Shopify Theme [Sections](Sections.md) and Snippets in
the form of child repositories in their respective namespaces.

## Prerequisites

Please make sure you have followed the [Setup Guide](Setup.md)

## Creating an Archie Collection

### Node Package Creation

We will start by creating a NodeJS Package.

```shell
# Save your collection name to a variable
collection="my-awesome-collection"

# Create and enter its folder
mkdir $collection && cd $collection

# Initialize the node package
npm init -y --scope=@archetype-themes
```

### Installing Archie

Now, let's set setup Archie

**Prerequisite:** Archie is private package fetched through GitHub. Therefore, authentication to GitHub's
@archetype-themes namespace is required.

```shell
# Install it first as a dev dependency to use it with your Collection.
npm install archetype-themes/archie --save-dev
# Install it as a per dependency as well. Theme owners will need archie to install your Collection
npm install archetype-themes/archie --save-peer
```

### Node Package Configuration

Next, you will need to edit your package.json in order to add/replace the following sections.

```json
{
  "archie": {
    "componentType": "collection",
    "gridSize": 6
  },
  "scripts": {
    "build": "archie build",
    "watch": "archie build --watch"
  },
  "workspaces": [
    "./sections/*",
    "./shared/*",
    "./snippets/*"
  ]
}
```

- Add the **archie** group with
    - The **"collection"** component type helps archie identify your package as a collection monorepo.
    - The **"gridSize"** is for postCSS. It is a default value that Themes can override.
- Add or change the **scripts**  groups
    - The **"build"** script starts a Collection build with Archie CLI. This is a shortcut to the
      full `npx archie build` command.
    - The **"watch"** script starts a Collection build with Archie CLI and watches for file changes within the
      Collection's source folders. It is a shortcut to the full `npx archie build --watch` command.
    - Adding the **workspaces** group indicates that this is a monorepo with multiples child repositories split in three
      groups.
        - The **"sections"** is the main workspace where you can create and edit as many Sections as you need. Archie's
          create command can help you generate files for a new Section.
        - The **"shared"** workspace is intended for styles librairies, internal javascript libraires or other assets
          that are shared by multiple sections.
        - The **"snippets"** workspace can contain an unlimited amount of snippets for use in any of the sections.
          Archie can help you create these Snippets.

Once installed and configured, you can always access Archie manually in the following way:

```shell
npx archie
```


## Using your Collection

Next up, what can we do with this... Collection? Follow the guide:

[Using a Collection](Using-a-Collection.md)
