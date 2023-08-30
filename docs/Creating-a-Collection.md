# Creating a Collection

An Archie Collection is a Node.js Monorepo that regroups multiple Shopify
Theme [Sections and Snippets](Sections-and-Snippets.md) in the form of Archie Components in child repositories in their
respective npm workspaces.

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

## Installing Archie

Now, let's set setup Archie

```shell
# Install it with NPM to use it with your Collection.
npm install archetype-themes/archie
```

## Node Package Configuration

Next, you will need to edit your package.json in order to add/replace the following sections.

```json
{
  "archie": {
    "componentType": "collection"
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
  - The `component type` **"collection"**  helps archie identify your package as a collection monorepo.
  - the `embedLocales` option can be set to boolean true or false. It defaults to false. If set to true, locales will be
    automatically structured as if they were in the section's schema. As featured
    in [Shopify Dev Themes Architecture: Sections Schema - Locales](https://shopify.dev/docs/themes/architecture/sections/section-schema#locales)
- Add or change the **scripts**  groups
  - The **"build"** script starts a Collection build with Archie CLI. This is a shortcut to the
    full `npx archie build` command.
  - The **"watch"** script starts a Collection build with Archie CLI and watches for file changes within the
    Collection's source folders. It is a shortcut to the full `npx archie build --watch` command.
  - Adding the **workspaces** group indicates that this is a monorepo with multiples child repositories split in three
    groups.
    - The **"sections"** is the main workspace where you can create and edit as many Sections as you need. Archie's
      create command can help you generate files for a new Section.
    - The **"shared"** workspace is intended for styles libraries, internal javascript libraries or other assets
      that are shared by multiple sections.
    - The **"snippets"** workspace can contain an unlimited amount of snippets for use in any of the sections.
      Archie can help you create these Snippets.

Once installed and configured, you can always access Archie manually in the following way:

```shell
npx archie
```

## Using your Collection

Next up, let's see what can be achieved with a Collection. Follow the guide [Using a Collection](Using-a-Collection.md)
