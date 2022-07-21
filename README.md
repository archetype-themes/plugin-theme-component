# Shopify Section-Builder

The section-builder takes care of assembling your section according to Shopify's standards while allowing you to set up
your section files as you wish.

## Install

This package is meant for use within the Archetype Themes Components Monorepo. When creating a new section package
inside the appropriate folder, simply use yarn or npm to add this module as a development dependency through its GitHub
address.

```shell
npm i https://github.com/archetype-themes/section-builder --save-dev
```

```shell
yarn add https://github.com/archetype-themes/section-builder --dev
```

## Usage

To build your section, just use the following command

```shell
npx section-builder
```

### Log Level

Section builder three levels log system, using the standard `info`, `debug`, `error`. By default, `info` is used. To use
a different log level, use the following flags when running the section-builder command:

* `--verbose` will activate `debug` log level and a great number of details on internal processes will be
  displayed.
* `--quiet` will activate `error` log level. Only errors will be displayed.

```shell
# Show Error, Info and Debug messages
npx section-builder --verbose
```

```shell
# Show only Error messages
npx section-builder --quiet
```

## Aaaand ACTION!

The script will analyze the contents of the section folder and create a final build in a folder of tha name. Here is how
it proceeds according to the file type detected.

### TLDR

#### Accepted input

```ignorelang
**/*.liquid
**/*.js
**/*.css
schema.json

# Ignored entries
!/build
!/node_modules
```

#### Expected Output

```shell
build/section-name.liquid
build/assets/section-name.js
build/assets/section-name.css
```

### JS Files

Any JavaScript file detected in the section folders will be merged in a single JavaScript file bearing the name of the
section and put in the assets' subfolder. Files are processed in alphabetical order.

`build/assets/section-name.js`

A reference to this JavaScript file will be inserted at the end of the liquid file with an async property.

`<script src="{{ 'section-name.js' | asset_url }}" async></script>`

It is possible to avoid merging a JavaScript file by manually including an HTML `<script>` tag inside a liquid file.
The file will be copied as is in the `build/assets` folder and will retain its original name.

#### Caveat

JS file manual inclusions inside the liquid code without the html `<script>` tag, such as with only liquid code
(ie: `{{ 'lightbox.js' | global_asset_url | script_tag }}`) are not detected at the moment and will result in a double
inclusion.

### JS Modules

### CSS Files

Any CSS file detected in the section folders will be merged in a single CSS file bearing the name of the section and put
in the assets' subfolder. Files are processed in alphabetical order.

`build/assets/section-name.css`

A reference to this CSS file will be inserted at the end of the liquid file.

`{{ '${section-name.css}' | global_asset_url | stylesheet_tag }}`

It is possible to avoid merging a CSS file by manually including an HTML `<link>` tag inside a liquid file.
The file will be copied as is in the `build/assets` folder and will retain its original name.

#### Caveat

At the moment Sass files are not processed.

CSS file manual inclusions inside the liquid code without the html `<link>` tag, such as with only liquid code
(ie: `{{ 'section-styles.css' | global_asset_url | stylesheet_tag }}`) is not detected at the moment and will result in
a double inclusion.

## Schema file

The schema file must be names `schema.json` in order to be processed correctly. Its content will be added at the end of
the section's liquid file.

## Liquid files

By default, any Liquid file detected in the section folders (recursively) will be merged in a single liquid file bearing
the name of the section and put at the root of the `build` folder. Files are processed in alphabetical order.

`build/section-name.liquid`

## Snippets

Coming Soon

