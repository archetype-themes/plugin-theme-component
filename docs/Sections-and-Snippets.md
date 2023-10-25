# Section & Snippet Components

Archie **Components** are either of Section or Snippet type. Their structure is identical, but they are used in
different ways.

## Components Structure

You'll find it easy to [add a new section](Using-a-Collection.md#adding-a-new-section)
or [snippet](Using-a-Collection.md#adding-a-new-snippet) to your collection with Archie. The related commands will
create your component's folder structure and add some example files to it.

Let's take a look at a component's structure. Below you'll find three examples of component folders.

**The Minimalist**

The minimalist approach. This is the bare minimum you need to create a component. You can use this approach if you don't
need all the extra fluffy stuff. Outside of `package.json`, The only mandatory file is the `main.liquid` file.
The `index.js` and `main.css` files are optional.

```shell
.
├── README.md                             [ Optional Component README file ]
├── package.json                          [ Mandatory NodeJS Package file ]
├── build                                 [ The build folder is generated and filled by Archie upon Section Build ]
├── index.js                              [ Optional Main Javascript File ]
├── main.css                              [ Optional Main Stylesheet ]
├── some-nice-section-name.liquid         [ Mandatory Main Liquid File, can have any name ]
└── schema.json                           [ Optional External Section Schema JSON file ]
```

**Keep It Simple**

Here we have a more complete component. It has `locales.json` and `locales.schema.json` files using the new Archie
multilingual approach. It also has an optional `assets` folder. You can use it to store your component's assets, such as
images, fonts, etc.

```shell
.
├── README.md                             [ Section README ]
├── package.json                          [ NodeJS Package file ]
├── build                                 [ Generated and filled by Archie upon Section Build ]
└── src
    ├── assets                            [ Static assets folder ]
    │   └── awesome-button.png                [ Example Asset File ]
    ├── index.js                          [ Optional Main Javascript File ]
    ├── main.css                          [ Optional Main Stylesheet ]
    ├── some-nice-section-name.liquid     [ Mandatory Main Liquid File ]
    ├── locales.json                      [ Optional Multilingual Locales File ]
    ├── locales.schema.json               [ Optional Multilingual Shema Locales File ]
    └── schema.json                       [ Optional External Section Schema JSON file ]
```

**Think Big!**

Here we have the Full Monty. This is the most complete component you can create. It adds a `scripts` folder, which is
intended for a more complex multiple-files javascript structure. It also adds a `styles` folder, which is intended for a
more advanced stylesheets structure. Note that, `locales` folder uses the classic single-language approach.

```shell
.
├── README.md                             [ Section README ]
├── package.json                          [ NodeJS Package ]
├── build                                 [ Generated and filled by Archie upon Section Build ]
└── src
    ├── assets                            [ Static assets folder ]
    │   └── awesome-button.png                [ Example Asset File ]
    ├── locales                           [ Locales folder ]
    │   ├── en.json                           [ Example Classic Single Language Locale Files ]
    │   ├── fr.json
    │   ├── fr-CA.json
    │   ├── en-US.json
    │   ├── en.schema.json                    [ Example Classic Single Language Schema Locale Files ]
    │   ├── fr.schema.json
    │   ├── fr-CA.schema.json
    │   └── en-US.schema.json
    ├── scripts                           [ Scripts Folder ]
    │   ├── index.js                          [ Main Javascript File ]
    │   └── models.js                         [ Example Additional Javascript File ]
    ├── snippets                          [ Internal Snippets folder ]
    │   └── cool-snippet.liquid               [ Example Snippet File ]
    ├── styles                            [ Styles Folder ]
    │   ├── layout                            [ Example Sass Additional Folder ]
    │   │   └── _navigation.scss                  [ Example Additional Sass File ]
    │   └── main.scss                         [Main Sass Stylesheet]
    ├── some-smart-section-name.liquid    [ Main Liquid File ]
    └── schema.json                       [ External Section Schema JSON file ]
```

**Now that you have a better understanding of the component's structure, let's take a look at each folder and file.**

---

### Root Folder

**package.json**
Your standard Node.js package configuration file, pre-populated with a few presets to help Archie with component type
and
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

---

### Build Folder

The build folder will be created when using Archie to build your Section or Collection. It is ephemeral content that
will be replaced upon each build. It will be ignored by Git and can be deleted safely.

**Pro Tip:** You should configure your IDE to ignore this folder.

---

### The Sources folder

```shell
.
└── src                                    [ Section sources ]
```

The use of a sources folder is optional. It is only used here as an example of clear separation of source files, build
files and Node.js package files.

#### Main Liquid file

The sources folder should contain your section's main liquid file. We recommend using your section's name as a filename
but this is not mandatory. Any ".liquid" file outside the "snippets" sub-folder will be considered as part of your
section's liquid content.

**Default structure**

```shell
.

└── src
    └── some-smart-section-name.liquid    [ Main Liquid File ]
```

Arbitrarily, for a huge section, it is possible to use multiple liquid files. They will be treated in alphabetical
order. Although this is possible, it is not recommended. Use of **Internal Snippets** is preferred.

**Advanced structure**

```shell
.

└── src
    ├── 01-header.liquid                  [ Main Liquid File - Part 1 ]
    ├── 02-body.liquid                    [ Main Liquid File - Part 2 ]
    └── 03-footer.liquid                  [ Main Liquid File - Part 3 ]
```

#### Schema JSON File

Let's face it. Section Schema is JSON content that should reside outside your main liquid file.

Archie uses an external schema.json file to separate it from your liquid file. Archie's build process will take care of
the rest.

:warning: Adoption of this feature is currently mandatory and any schema JSON content should be stripped from your
liquid files to avoid problems. Refer to:

* [Issue 33](https://github.com/archetype-themes/archie/issues/33): Section Schema must be in an external JSON file. Any
  section schema json in a liquid file is ignored.

---

### The Assets Folder

```shell
.
└── src                                   [ Section sources ]
    └── assets                                [ Section static assets ]
```

Assets folder can be used for static assets. These files will be copied as-is inside the Theme's assets folder upon
Install. You can use them in the same way a Shopify Theme Dev would.

**Pro Tip:** This is intended for images and documents. JavaScript and Styles should be in their respective
folders or in your Collection's `shared` namespace.

---

### The Locales Folder

```shell
.
└── src                                   [ Section sources ]
    └── assets                                [ Section locales and schema locales ]
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

Storefront locales can be brought together in `locales/locales.json` in a simplified structure. This is also
available for Schema under `locales/locales.schema.json`. The structure hierarchy is a parent locale with children
descriptions and their translations.

**Example file structure**

````shell
.
└── locales
    └── locales.json                  [ Multi-Language Locale File ]
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
└── locales
    ├── en.json                       [ English Universal Locale File ]
    └── fr-CA.json                    [ French Canada Schema Locales File ]

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

---

### The Scripts Folder

The scripts folder is a suggested name. You can use another folder name or put your files in the root `src` folder.
However, you must start your section's JavaScript code with an `index.(js|mjs)` file and code modern JavaScript, Archie
takes care of the rest.

Include JavaScript libraries as npm dependencies to your section. If multiple sections require the same dependency,
Archie will handle this through node's monorepo library management.

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

- Inside that workspace, create a Node.js Module.

```shell
# From the Collection's root folder, create the necessary path
mkdir -p shared/[collection-name]-core-js
cd shared/[collection-name]-core-js
npm init

```

- Include the new Node.js module as a Section dependency.

**package.json**

```json
{
  "dependencies": {
    "[collection-name]-js-core": "workspace:shared/[collection-name]-js-core"
  }
}
```

**External NodeJS Module**

- Create an external Node.js module inside a new Git repository
- Include the new Node.js module with npm as a Section dependency.

```shell
# Add a package from our GitHub Package Repository
npm install @archetype-themes/js-core
npm install @archetype-themes/js-core#1.14.5

```

---

### The Snippets Folder

The snippets folder is reserved for **Internal Snippets** If you need to avoid duplicate code within your Section's
liquid file, you can create an **Internal Snippet** in that folder, in the form of a single liquid file. Internal

#### Internal Snippets Limitations

Internal Snippets are not allowed any external JavaScript files, Stylesheets, Locale files or any other component
features that are reserved to **Sections** or **Individual Snippets**. To benefit from these additional features, you
must create an **Individual Snippet Component**.

#### When Not To Use Internal Snippets

Internal Snippets are only accessible within your section. Should you intend to share a Snippet between sections, it
should be created as an **Individual Snippet** component. Therefore, it should be stored in your Collection's snippet
workspace, not here.

#### How To Render Internal Snippets

Whether your snippet is internal or external, you can refer to it in liquid files the usual way, using
the `{% render %}` liquid tag.

#### How Does Archie Handle Internal Snippets

When Archie encounters the `{% render %}` liquid tag, it will first search your component's internal snippets
sub-folder. If it is not found, Archie will then search your Collection's `snippets` workspace folder, where shared
snippets reside.

---

### SVG Snippets

There is a subtype of snippet that benefits from SVG optimisation process. The liquid files need to be named in a
specific way and their content should be limited to a single SVG image.

#### Name formats recognized as SVG

Any one of these name patterns, or any combination of them, will trigger SVG Optimization process.

- Ends with `.svg.liquid`, ie: `star.svg.liquid`
- Ends with `-svg`, ie: `star-svg.liquid`
- Starts with `icon-`, ie: `icon-star.liquid`

#### Process for the files

- The files will be optimized through SVGO
  - Options for SVGO optimization can be set using an `svgo.config.js` file at the root of your Collection repository.
    - See the SVGO [Configuration](https://github.com/svg/svgo#configuration) documentation for available options.
- The HTML `<svg>` tag will be added the following attributes:
  - `"aria-hidden"="true"`
  - `"focusable"="false"`
  - `"role"="presentation"`
- Their HTML `<svg>` tag will be added the following classes:
  - The `icon` CSS class.
  - The `[filename]` CSS class. I.e.: `"class"="star-svg"`
  - The `icon--wide` CSS class **if** the Width to Height ratio being above 1.5.
  - The `icon--full-color` CSS class ** if** the svg file name contains `-full-color`.

---

### The Styles Folder

Start writing your section's styles in a main.css|sass|scss file. Include additional sheets from there and Archie
takes care of the rest.

Archie assumes that you will be consistent. Your Section styles can be in multiple files, but they should all have the
same extension. Use of mixed extensions within the same Section will cause issues. It is however possible to have one
Section using sass and another section using normal/postCSS CSS.

#### Shared Common Styles Library

It is very much so possible to create a shared Styles library. You should use your Collection's "shared" workspace for
consistency, even though embedding it in a Node.js package is not required.

The additional namespace configuration in package.json and npm init command necessary for a Javascript Core library do
not apply here since we will include the files through a relative path.

Simply create the necessary folders and code away.

```shell
# From the Collection's root folder, create your core stylesheets path
mkdir -p shared/[collection-name]-styles-core

```

Use the appropriate command to include the necessary files with a relative path.

```css
/* CSS/PostCSS Import styles core example */
@import url('../../../../shared/[collection-name]-postcss-core/src/main.css');
```

Alternatively, with the use of the [postcss-import](https://github.com/postcss/postcss-import#readme) plugin, your
imports could take a more elegant form. Please add [postcss-import](https://github.com/postcss/postcss-import#readme) to
your Collection's postcss.config.js file [options](https://github.com/postcss/postcss/#options).

```css
/* CSS/PostCSS Import styles core example */
@import "@archetype-themes/styles/index.css";
```

---

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

---

## Install a Section

When part of a collection, a section can be installed within a Shopify Theme. Please read the [Themes](Themes.md)
documentation to learn more.
