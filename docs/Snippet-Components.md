# Snippet Components

Archetype Themes CLI's **Components** will be built as Shopify Theme Snippets, and therefore support all of their
features, and more.

## Component Structure

You'll find it easy to [add a new component](Growing-Your-Collection.md#adding-a-new-component) to your collection with
our CLI. We can create your component's folder structure and add some example files to it.

Let's take a look at a component's structure. Below you'll find three examples of component folders.

**The Minimalist**

The minimalist approach. This is the bare minimum you need to create a component. You can use this approach if you don't
need all the extra fluffy stuff. Outside of `package.json`, The only mandatory file is the `main.liquid` file.

```shell
.
├── package.json                  [ Mandatory NodeJS Package file ]
└── [component-name].liquid       [ Mandatory Main Liquid File, can have any name ]
```

**Keep It Simple**

Here we have a more complete component. It has an optional `assets` folder. You can use it to store your component's
JavaScript files and other assets, such as images, fonts, etc.

```shell
.
├── README.md                         [ Component README file ]
├── package.json                      [ NodeJS Package file ]
├── assets                            [ Static assets folder ]
│   ├── [component-name].js           [ Main JavaScript File ]
│   └── awesome-button.png            [ Example Asset File ]
├── [component-name].css              [ Main Stylesheet ]
└── [component-name].liquid           [ Main Liquid File ]
```

**Think Big!**

Here we have the Full Monty. This is the most complete component you can create. It adds a `scripts` folder, which is
intended for a more complex multiple-files javascript structure. It also adds a `styles` folder, which is intended for a
more advanced stylesheets structure. Note that, `locales` folder uses the classic single-language approach.

```shell
.
├── README.md                         [ Component README ]
├── package.json                      [ NodeJS Package ]
├── assets                            [ Static assets folder ]
│   ├── [component-name].js           [ Main Javascript File ]
│   ├── animation.js                  [ Additional Javascript File (imported by the main JavsScript file) ]
│   └── icon-close.png                [ Example Asset File ]
├── snippets                          [ Internal Snippets folder ]
│   └── item-row.liquid               [ Example Snippet File ]
├── styles                            [ Static assets folder ]
│   ├── [component-name].css          [ Main Stylesheet ]
│   ├── _layout.css                   [ Layout Specific Stylesheet (imported by main stylesheet) ]
│   └── _fonts.css                    [ Font Face Specific Stylesheet (imported by main stylesheet) ]
└── [component-name].liquid           [ Main Liquid File ]
```

**Now that you have a better understanding of the component's structure, let's take a look at each folder and file.**

---

### Root Folder

**package.json**
Your standard Node.js package configuration file, pre-populated with a few presets to help our CLI with component type
and the likes.

**README.md**

The root folder will contain a README that you should fill with the Component Details.

Here are a few pointers on what it could contain.

- Name and purpose
- Functionalities
- Dependencies
- Available Settings
- Release Date
- Change log, if not using CHANGES.md

**Pro Tip:** Try to be consistent and keep the same structure in all your Components' README

#### Main Liquid file

The root folder should contain your component's main liquid file. We recommend using your component's name as a filename
but this is not mandatory. Any ".liquid" file outside the "snippets" sub-folder will be considered as part of your
component's liquid content.

---

### The Assets Folder

Assets folder can be used for static assets. These files will be copied as-is inside the Theme's assets folder upon
Install. You can use them in the same way a Shopify Theme Dev would.

#### JavaScript Files

You must start your component's JavaScript code with an `[component-name].(js|mjs)` file and use ESM imports. Our CLI
takes care of the rest.

Include JavaScript libraries as npm dependencies to your component. If multiple components require the same dependency,
our CLI will handle this through node's monorepo library management.

**Pro Tip:** Downloading a static Javascript library and putting it in your `assets` folder will circumvent any CLI
optimizations from happening. Therefore, it is considered an Anti-Pattern.

#### Shared JavaScript Core

If multiple Components share some internal JS code, two options are available:

**Internal NodeJS Module**

This method is recommended if you only have one Collection or if you do not intend to share your JavaScript Core with
further Collections.

- Inside your Collection monorepo, create a **shared** workspace.

```json
{
  "workspaces": [
    "components/*",
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

- Include the new Node.js module as a Component dependency.

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
- Include the new Node.js module with npm as a Component dependency.

```shell
# Add a package from our GitHub Package Repository
npm install @archetype-themes/js-core
npm install @archetype-themes/js-core#1.14.5

```

---

### The Snippets Folder

The snippets folder is reserved for **Internal Snippets** If you need to avoid duplicate code within your Component's
liquid file, you can create an **Internal Snippet** in that folder, in the form of a single liquid file.

#### Internal Snippets Limitations

Internal Snippets are not allowed any external JavaScript files, Stylesheets, Locale files or any other component
features that are reserved to **Components**. To benefit from these additional features, you must create an **Individual
Component**.

#### When Not To Use Internal Snippets

Internal Snippets are only accessible within your component. Should you intend to share a Snippet between components, it
should be created as an **Individual Component**.

#### How To Render Internal Snippets

Whether your snippet is internal or external, you can refer to it in liquid files the usual way, using
the `{% render %}` liquid tag. Our CLI will handle snippet resolution automatically at build time.

#### How The CLI Handle Internal Snippets

When our CLI encounter the `{% render %}` liquid tag, it will first search your component's internal snippets
sub-folder. When it is not found, it will then search your Collection's `components` workspace folder.

---

### SVG Components

There is a subtype of component that benefits from SVG optimisation process. The liquid files need to be named in a
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

Start writing your component's styles in a main.css file. Include additional sheets from there and our CLI takes care of
the rest.

#### Shared Common Styles Library

It is very much so possible to create a shared Styles library. You should use your Collection's "shared" workspace for
consistency, even though embedding it in a Node.js package is not required.

The additional namespace configuration in package.json and npm init command necessary for a Javascript Core library do
not apply here since we will include the files through a relative path.

Simply create the necessary folders and code away.

```shell
# From the Collection's root folder, create your shared stylesheets path
mkdir -p shared/[collection-name]-styles

```

Use the appropriate command to include the necessary files with a relative path.

```css
/* CSS/PostCSS Import styles core example */
@import url('../../../../shared/[collection-name]-styles/main.css');
```

Alternatively, with the use of the [postcss-import](https://github.com/postcss/postcss-import#readme) plugin, your
imports could take a more elegant form. Please add [postcss-import](https://github.com/postcss/postcss-import#readme) to
your Collection's postcss.config.js file [options](https://github.com/postcss/postcss/#options).

```css
/* CSS/PostCSS Import styles core example */
@import "@archetype-themes/styles/index.css";
```

---

## Component commands

### Build a Component

Building a component is pretty simple with Archetype Themes' CLI, simply run

```shell
npx archie build component [component-name]

# Use the watch flag to refresh build on file change
npx archie build component [component-name] --watch
```

**Watch Flag**

Using the watch flag, `--watch` or`-w`, will make the CLI monitor source folders and refresh your build on any file
change. You can stop the process by pressing **Ctrl+C** on your keyboard.

---

## Install a Component

When part of a collection, a component can be installed within a Shopify Theme. Please read the [Themes](Themes.md)
documentation to learn more.
