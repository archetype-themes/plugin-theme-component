# Build Process

Let's see what happens behind the curtains

## Liquid files

By default, any Liquid file detected in the section folders (recursively) will be merged in a single liquid file bearing
the name of the section and put at the root of the `build` folder. Files are processed in alphabetical order.

- Schema will be appended. The content will consist of an assembly of locales.json and schema.json

Output files :
```shell
# For Collections
build/sections/[section-name-one].liquid
build/sections/[section-name-two].liquid
build/sections/[section-name-three].liquid

# For Sections
build/section-name.liquid
```

### JavaScript Build Process

Archie will look for an `index.js` or a `main.js` file in your `src` folder. Any other javascript file or module that is
used by your main file will automatically be processed.

**Recursion:** If your Section includes Snippets with external javascript files, Archie will also look for their main javascript file
and process it.

**Notes**
- The mjs file extension is also accepted.
- Use of a scripts sub-folder is recommended but not compulsory. Archie will search the whole src directory tree for
  your main JavaScript file.

**Resulting files**

```shell
# For Collections
build/assets/[collection-name].js

# For Sections
build/assets/[section-name].js
```

A reference to this JavaScript file will be inserted
- For A Section Build: At the end of the section's liquid file
- For A Theme Install: Just before the closing </head> tag of a `theme.liquid` file (only if missing - won't add twice)

```liquid
<script src="{{ '[collection-name||section-name].js' | asset_url }}" async></script>
```

**Note**
- Theme install: Customization of that script tag is possible. Archie will check for an existing reference to the
  javascript file before insertion and will not proceed if it already exists, it will not be overwritten.

**External Tools**

JavaScript is built using [esbuild](https://esbuild.github.io/) bundler


### Stylesheets Build Process

Archie will look for an `index.css` or a `main.css` file in your `src` folder. Any
other javascript file or module that is used by your main file will automatically be processed.

**Recursion:** If your Section includes Snippets with external stylesheets, Archie will also look for their main
stylesheet and process it.

**Notes**
- Sass and Less is also handled. Your main file can also use any of the following extensions (css|sass|scss|less)
- Use of a styles sub-folder is recommended but not compulsory. Archie will search the whole src directory tree for
  your main stylesheet.

**Resulting files**

```shell
# For Collections
build/assets/[collection-name].css

# For Sections
build/assets/[section-name].css
```


A reference to this CSS file will be inserted
- For A Section Build: At the end of the section's liquid file
- For A Theme Install: Just before the closing </head> tag of a `theme.liquid` file (only if missing - won't add twice)
  A reference to this CSS file will be inserted at the end of the liquid file.

```liquid
{{ '${section-name.css}' | global_asset_url | stylesheet_tag }}
```

**External Tools**

Stylesheet are built using [esbuild](https://esbuild.github.io/) bundler


## Locales Build Transformations

Storefront locales will be brought back as is under the Section's schema file.*

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
