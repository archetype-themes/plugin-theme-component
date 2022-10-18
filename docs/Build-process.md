# Build Process

Let's see what happens behind the curtains

## Sections

## Liquid files

By default, any Liquid file detected in the section folders (recursively) will be merged in a single liquid file bearing
the name of the section and put at the root of the `build` folder. Files are processed in alphabetical order.

- Any Snippet rendering liquid tag will be replaced by the actual Snippet's content, unless it is a for loop.
- Schema will be appended. The content will consist of an assembly of locales.json and schema.json

Output file: 
```shell
# For Collections
build/[collection-name].liquid

# For Sections
build/section-name.liquid
```

### JavaScript Build Process

Archie will look for an `index.js` or a `main.js` file in your `src` folder. Any other javascript file or module that is
 used by your main file will automatically be processed. 

If your Section happens to include some Snippets with external javascript files, Archie will also look for their main
 javascript file and process them.

**Notes**
- The mjs file extension is also accepted.
- Use of a scripts sub-folder is recommended but not compulsory since Archie will search the whole src diretory tree for
  your main JavaScript file.

**Resulting files**

```shell
# For Collections
build/assets/[collection-name].js

# For Sections
build/assets/[section-name].js
```

A reference to this JavaScript file will be inserted when needed.

- Section build: At the end of the section's liquid file
- Collection Theme install: Just before the closing </head> tag of a theme.liquid file

```liquid
<script src="{{ '[collection-name||section-name].js' | asset_url }}" async></script>
```

**Note**
- Theme install: Customization of that script tag is possible. Archie will check for an existing reference to the 
  javascript file before insertion and will not proceed if it already exists, it will not be overwritten. 

### Stylesheets Build Process

Archie will look for an `index.(css|sass|scss|less)` or a `main.(css|sass|scss|less)` file in your `src` folder. Any other javascript file or module that is used
by your main file will automatically be processed. 

Any stylesheet file detected in the section folders will be merged in a single CSS file bearing the name of the section and put
in the assets' sub-folder. Files are processed in alphabetical order.

`build/assets/section-name.css`

A reference to this CSS file will be inserted at the end of the liquid file.

`{{ '${section-name.css}' | global_asset_url | stylesheet_tag }}`

It is possible to avoid merging a CSS file by manually including an HTML `<link>` tag inside a liquid file.
The file will be copied as is in the `build/assets` folder and will retain its original name.


## Locales Build Transformations

Storefront locales will be brought back as is under the Section's schema file.*

Since Schema Locales can not be embedded in the section schema, they will be split in the classic one file per locale
structure. Mapped category will always be "sections" and mapped group will always be your section name.**

Archie will check for used Snippets at build time and will merge Snippet Locales with the Section's Locales, if any.

<sup>* To learn more about this structure, please refer to shopify.dev under
[section-schema locales](https://shopify.dev/themes/architecture/sections/section-schema#locales)</sup><br>
<sup>** This mapping is implemented to match Shopify behaviour
for [section-schema locales](https://shopify.dev/themes/architecture/sections/section-schema#locales)</sup>


## Expected final Output

```shell
build/section-name.liquid
build/assets/section-name.js
build/assets/section-name.css
build/locales/en-US.schema.json
build/locales/fr-CA.schema.json
```
