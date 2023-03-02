# Archie Collections - User's Guide

An Archie Collection is a NodeJS Monorepo that regroups multiple Shopify
Theme [Sections and Snippets](Sections-and-Snippets.md)  in the form of child repositories in their respective
namespaces.

## Child Section and Snippet modules

The main goal for having a collection is to populate it with [Sections and Snippets](Sections-and-Snippets.md). Child
[Sections and Snippets](Sections-and-Snippets.md) are stored in their respective workspace sub-folders. You can manually
create a section, or you can use **archie** to generate a skeleton for you, saving you from creating some boilerplate
code.

### Adding a new Section

```shell
npx archie create section [some-smart-section-name]
```

Template files will be populated under the `sections/some-smart-section-name` folder.

### Adding a new Snippet

```shell
npx archie create snippet [some-useful-snippet-name]
```

Template files will be populated under the `snippets/some-useful-snippet-name` folder.

Please refer to the [Sections and Snippets](Sections-and-Snippets.md) guide for further details.

## Building your collection

```shell
npx archie build collection

# Use the watch flag to refresh build on file change
npx archie build collection --watch
```

This will package your collection's sections and snippets together inside the **build** sub-folder.

**Watch Flag**
Using the watch flag, `--watch` or`-w`, will keep Archie running. Archie will monitor source folders and refresh your
build on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

## Installing your Collection

Installing your collection must be done from the [Theme](Themes.md) component. Please refer to that documentation.
