# Archie Collections - User's Guide

An Archie Collection is a NodeJS Monorepo that regroups multiple Shopify Theme [Sections](Sections.md) and Snippets in
the form of child repositories in their respective namespaces.

## Child Section and Snippet modules

The main goal for having a collection is to populate it with sections and snippets. Child Sections and Snippets are
stored in their respective workspace sub-folders. You can manually create a section, or you can use **archie** to
generate a skeleton for you, saving you from creating some boilerplate code.

### Creating an Archie Section within your Collection

```shell
archie create section [some-smart-section-name]
```

Template files will be populated under the `sections/some-smart-section-name` sub-folder.

#### Creating an Archie Snippet within your Collection

```shell
archie create snippet [some-useful-snippet-name]
```

Template files will be populated under the `snippets/some-useful-snippet-name` sub-folder.

For both Sections and Snippets, please refer to the [Sections Guide](Sections.md) for more information

## Building your collection

```shell
archie build collection
```

This will package your collection's sections and snippets together inside the **build** sub-folder.

## Installing your Collection

Installing your collection must be done from the [Theme](Themes.md) component. Please refer to that documentation.
