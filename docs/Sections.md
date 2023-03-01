# Archie Sections

## Sections Structure

[Within an Archie Collection, you can create a section](Using-a-Collection.md#creating-an-archie-section-within-your-collection)
. This will generate a basic section folder structure and some template code. This reflects the structure of a standard
Archie Section. Let's take a look.

```shell
.
├── README.md                             [Section README]
├── package.json                          [NodeJS Package]
├── build                                 [Generated and filled by Archie upon Section Build]
└── src
    ├── assets                            [Static assets folder]                     
    ├── locales                     
    │   ├── locales.json                  [Multi-Language Locales File]
    │   └── locales.schema.json           [Multi-Language Schema Locales File]
    ├── schema.json                       [External Section Schema JSON file]
    ├── scripts
    │   └── index.js                      [Main Javascript File]
    ├── snippets                          [Internal Snippets]
    ├── some-smart-section-name.liquid    [Main Liquid File]
    └── styles                          
        └── main.scss                     [Main Stylesheet]
```

### Root Folder

**package.json**
Your standard NodeJS package configuration file, pre-populated with a few presets to help Archie with component type and
the likes.

**README.md**

The root folder will contain a README that you should fill with the Section Details.

Here are a few pointers on what it could contain.

- Name and purpose
- Functionalities
- Dependencies
- Available Settings
- Release Date
- Change log, if not using CHANGES.md

**Pro Tip:** Try to be consistent and keep the same structure in all your Sections' README

### Build Folder

The build folder will be created when using Archie to build your Section or Collection. It is ephemeral content that
will be replaced upon each build. It will be ignored by Git and can be deleted safely.

**Pro Tip:** You should configure your IDE to ignore this folder.

### The Sources folder

```shell
.
└── src [Section sources]
```

All project files are located in a sub-folder named `src`, Later on, transformations to your source files will
occur through Archie's Build process and the final results will be written to the `build` folder.

#### Main Liquid file

The sources folder should contain your section's main liquid file. We recommend using your section's name as a filename
but this is not mandatory. Any ".liquid" file outside the "snippets" sub-folder will be considered as part of your
section's liquid content.

**Default structure**

```shell
.

└── src
    └── some-smart-section-name.liquid    [Main Liquid File]
```

Arbitrarily, for a huge section, it is possible to use multiple liquid files. They will be treated in alphabetical
order. Although this is possible, it is not recommended. Use of **Internal Snippets** is preferred.

**Advanced structure**

```shell
.

└── src
    ├── 01-header.liquid    [Main Liquid File - Part 1]
    ├── 02-body.liquid      [Main Liquid File - Part 2]
    └── 03-footer.liquid    [Main Liquid File - Part 3]
```

#### Schema JSON File

Let's face it. Section Schema is JSON content that should reside outside your main liquid file.

Archie uses an external schema.json file to separate it from your liquid file. Archie's build process will take care of
the rest.

:warning: Adoption of this feature is currently mandatory and any schema JSON content should be stripped from your
liquid files to avoid problems. Refer to:

* [Issue 33](https://github.com/archetype-themes/archie/issues/33): Section Schema must be in an external JSON file. Any
  section schema json in a liquid file is ignored.

****

### The Assets Folder

```shell
.
└── src         [Section sources]
    └── assets  [Section static assets]
```

Assets folder can be used for static assets. These files will be copied as-is inside the Theme's assets folder upon
Install. You can use them in the same way a Shopify Theme Dev would.

**Pro Tip:** This is intended for images and documents. JavaScript and Styles should be in their respective
folders or in your Collection's `shared` namespace.

### The Locales Folder

```shell
.
└── src         [Section sources]
    └── assets  [Section locales and schema locales]
```

Locales can be organized in one of two ways. You can use the traditional way, which is one file per locale, or you can
regroup all your locales in a single **locales.json** file.

Locales Grouping is a feature inspired by an existing Section-Schema "Locales"
element[*](https://shopify.dev/themes/architecture/sections/section-schema#locales). In fact, this is exactly where
Archie will output the final contents of your locales during the build phase.

Since Schema Locales can not be embedded within the Section-Schema, Archie will generate individual files for each
language at build time. Upon install, their content will be merged with the Theme's Schema-Locale files.

**Default Locale file**

There is no notion of default language file in a Collection, this is handled on a Theme level individually. Files with
names such as **en.default.json** will be ignored.

**Child Snippet Locales**

Snippet Components can have Locale files as well. These will be merged with the Section's locales under the parent
Section's Category and Group. Evidently, if a snippet is used by two different Sections, its texts will appear under
each Section's Group. This allows contextual customization of Snippet texts.

#### Locale Files: The Archie Way

Tired of managing a huge number of locale files with a never ending scroll to reach your section? Isolate your section's
translations and regroup all your locales in one file and let **Archie**  take care of the rest!

Storefront locales can be brought together in `src/locales/locales.json` in a simplified structure. This is also
available for Schema under `src/locales/locales.schema.json`. The structure hierarchy is a parent locale with children
descriptions and their translations.

**Example file structure**

````shell
.
└── src
    └── locales                     
        └── locales.json                  [Multi-Language Locales File]
````

**locales.json**

```json
{
  "en": {
    "save_button": "Save",
    "cancel_button": "Cancel"
  },
  "fr": {
    "save_button": "Sauvegarder",
    "cancel_button": "Annuler"
  }
}
```

#### Locale Files: The Classic Way

Use of separate files per language is still accepted. However, for compatibility reason, you must strip Category and
Group[*](https://shopify.dev/themes/architecture/locales#schema). These will be generated automatically by Archie.

**Example file structure**

```shell
.
└── src
    └── locales                     
        ├── en.json                  [English Universal Locales File]
        └── fr-CA.json           [French Canada Schema Locales File]

```

**en.json**

```json
{
  "save_button": "Save",
  "cancel_button": "Cancel"
}
```

**fr-CA.json**

```json
{
  "save_button": "Sauvegarder",
  "cancel_button": "Annuler"
}
```

### The Scripts Folder

Start your section's JavaScript code with an index.js|mjs file and code modern JavaScript, Archie takes care of the
rest.

Include JavaScript librairies as yarn dependencies for your section. If multiple sections require the same dependency,
Archie will handle this through yarn's monorepo library management.

**Pro Tip:** Downloading a static Javascript library and putting it in your `assets` folder will circumvent any Archie
optimizations from happening. Therefore, it is considered an Anti-Pattern.

#### Shared JavaScript Core

If multiple Sections share some internal JS code, two options are available:

**Internal NodeJS Module**

This method is recommended if you only have one Collection or if you do not intend to share your JavaScript Core with
further Collections.

- Inside your Collection monorepo, create a **shared** workspace.

```json
{
  "workspaces": [
    "sections/*",
    "snippets/*",
    "shared/*"
  ]
}
```

- Inside that workspace, create a NodeJS Module.

```shell
# From the Collection's root folder, create the necessary path
mkdir -p shared/[collection-name]-core-js
cd shared/[collection-name]-core-js
yarn init -2

```

- Include the new NodeJS module as a Section dependency.

**package.json**

```json
{
  "dependencies": {
    "[collection-name]-js-core": "workspace:shared/[collection-name]-js-core"
  }
}
```

**External NodeJS Module**

- Create an external NodeJS module inside a new Git repository
- Include the new NodeJS module with yarn as a Section dependency.

```shell
# Add a package from a GitHub repository (the master branch) to the current workspace using the GitHub protocol
yarn add js-core@archetype-themes/js-core

# Using the following syntax, you can specify a branch, a tag, or a commit after the "#"
yarn add js-core@archetype-themes/js-core#develop
yarn add js-core@archetype-themes/js-core#1.14.5
yarn add js-core@archetype-themes/js-core#46965484bd
```

More information: [Yarn CLI: *add* command documentation](https://yarnpkg.com/cli/add)

### The Snippets Folder

If you intend to share a Snippet between sections, it should be external to your Section. Therefore, it should be stored
in your Collection's snippet workspace, not here.

However, if you need to avoid duplicate code within your Section, you can create an **Internal Snippet** and call it
using the `{% render %}` liquid tag as you would normally do with liquid.

When Archie encounters the `{% render %}` liquid tag, it will search within this snippet sub-folder first. If the
snippet is not found, it will search the Collection `snippets` folder, where all shared snippets reside.

Internal Snippets consist of a single file. They do not have their own external JavaScript files, Stylesheets, Locale
files or any other features that are reserved to External Snippets residing inside the Collection's Snippet Workspace.

### The Styles Folder

Start writing your section's styles in a main.css|sass|scss file. Include additional sheets from there and Archie
takes care of the rest.

Archie assumes that you will be consistent. Your Section styles can be in multiple files, but they should all have the
same extension. Use of mixed extensions within the same Section will cause issues. It is however possible to have one
Section using sass and another section using normal/postCSS CSS.

#### Shared Common Styles Library

It is very much so possible to create a shared Styles library. You should use your Collection's "shared" workspace for
consistency, even though embedding it in a NodeJS package is not required.

The additional namespace configuration in package.json and yarn init command necessary for a Javascript Core library do
not apply here since we will include the files with a relative path.

Simply create the necessary folders and code away.

```shell
# From the Collection's root folder, create your core stylesheets path
mkdir -p shared/[collection-name]-styles-core

```

Use the appropriate command to
include the necessary files with a relative path.

```sass
// SASS/SCSS Import styles core example
@use "../../../../shared/[collection-name]-styles-core/src/main";
```

```css
/* CSS/PostCSS Import styles core example */
@import url('../../../../shared/[collection-name]-postcss-core/src/main.css');
```

## Section commands

### Build a Section

Building a section from its root folder is pretty simple with Archie, just run

```shell
npx archie build section

# Use the watch flag to refresh build on file change
npx archie build section --watch
```

If you are one level up, that is, inside the parent Collection folder, you need to specify the section's name.

```shell
npx archie build section [some-smart-section-name]

# Use the watch flag to refresh build on file change
npx archie build section [some-smart-section-name] -w
```

**Watch Flag**

Using the watch flag, `--watch` or`-w`, will keep Archie running. Archie will monitor source folders and refresh your
build on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

## Install a Section

When part of a collection, a section can be installed within a Shopify Theme. Please read the [Themes](Themes.md)
documentation to learn more.
