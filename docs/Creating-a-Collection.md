# Creating a Collection

A Collection is a Node.js Monorepo that regroups multiple Shopify Theme [Snippet Components](Snippet-Components.md) in
the form of child repositories in their respective npm workspaces.

## Node Package Creation

We will start by creating a Node.js Package.

```shell
# Save your collection name to a variable
collection="my-awesome-collection"

# Create and enter its folder
mkdir $collection && cd $collection

# Initialize the node package
npm init -y --scope=@archetype-themes
```

## Installing The CLI

Now, let's install the CLI

```shell
# Install it with NPM to use it with your Collection.
npm install @archetype-themes/archie
```

## Node Package Configuration

Next, you will need to edit your package.json in order to add/replace the following sections.

```json
{
  "archie": {
    "type": "collection"
  },
  "scripts": {
    "build": "archie build",
    "dev": "archie build --watch"
  },
  "workspaces": [
    "./components/*",
    "./shared/*"
  ]
}
```

- Add the **archie** group with
  - Set the component `type` to **"collection"**  to ensure the CLI identifies your package as a collection monorepo.
- Add or change the **scripts**  groups
  - The **"build"** script starts a Collection build with the CLI. This is a shortcut to the full `npx archie build`
    command.
  - The **"dev"** script starts a Collection build with the CLI and watches for file changes within the Collection's
    source folders. It is a shortcut to the full `npx archie build --watch` command.
  - Adding the **workspaces** group indicates that this is a monorepo with multiples child repositories split in three
    groups.
    - The **"components"** workspace is where you can create and edit as many Snippet Components as you need. Our CLI's
      create command can help you generate files for a new Component.
    - The **"shared"** workspace is intended for shared style libraries, shared internal javascript libraries or other
      assets that are reused by multiple components.

Once installed and configured, you can always access the CLI manually in the following way:

```shell
npx archie
```

## Creating an ignore file

To avoid saving temporary build files in the repository. You need to create a `.gitignore` file at the root of your
project.

```gitignore
# Archetype Themes Component Plugin
/build
/.explorer
/.locales

# Node.js packages
/node_modules

#MacOS
.DS_Store
```

## Growing Your Collection

Next up, let's find out how to [Grow Your Collection](Growing-Your-Collection.md)
