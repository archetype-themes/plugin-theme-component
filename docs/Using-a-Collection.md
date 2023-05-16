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

Please refer to the [Sections and Snippets](Sections-and-Snippets.md) guide for details on these components.

### The Template Files

The source template files are located under the [``resources/component-files``](../resources/component-files) folder and
the [``resources/section-files``](../resources/section-files) folder. The files will be copied as is into the new
section/snippet folder.

The files in the [``resources/section-files``](../resources/section-files) folder are exclusive to sections.

The files contain variables in the form of JavaScript Template Strings. These variables will be replaced with their
actual value upon creation. The available variables are:

````javascript
${collectionName}   // The name of the parent collection
${componentName}    // The name of the component
${componentType}    // The type of the component (section or snippet)
${packageName}      // The name of the NPM package for the component with scope
````

**Pro Tip:** As an Archetype Themes developer, you can edit these files to your liking. You can also add new files to
the
[``resources/component-files``](../resources/component-files) folder and they will be copied over to the new
section/snippet.

## Building your collection
```shell
npx archie build collection

# Use the watch flag to refresh build on file change
npx archie build collection --watch
```
This will package your collection's sections and snippets together inside the **build** sub-folder.

**PostCSS Build Pro Tips:**
When using PostCSS, use of a PostCSS config file at the root of your Collection is recommended. Archie will load it through the use of [postcss-load-config](https://www.npmjs.com/package/postcss-load-config) and take it into consideration when building a section, a collection or even when installing to a theme.

Reference to some [postcss.config.js usage examples](https://github.com/postcss/postcss#usage)
Reference to [available postcss process options](https://postcss.org/api/#processoptions)
Reference to the active list of [available PostCSS plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md) or the [searchable catalog](https://www.postcss.parts/)

**JavScript Build Pro Tips:**
Archie uses [esbuild](https://esbuild.github.io/) to bundle your javascript. Use of an ESBuild config file at the root of your Collection is optional. Archie will load it and take it into consideration when building a section, a collection or even when installing to a theme. This configuration import feature is specific to Archie and is not documented on esbuild's website.

Here is an example of such a configuration files:

````javascript
import browsers from '@shopify/browserslist-config' // A list of browsers that we support
import { resolveToEsbuildTarget } from 'esbuild-plugin-browserslist'
import browserslist from 'browserslist'

export default {
  bundle: true,
  charset: 'utf8',
  format: 'cjs', // Defaults to iife on browser platform, but this wraps the code inside an immediately-invoked function expression
  platform: 'browser', // Allows native browser variables
  target: resolveToEsbuildTarget(browserslist(browsers)),
  // drop: ['console'], // Enable this to automatically remove console.log entries
  minify: true,  // Enable this to minify JS
  sourcemap: false // Enables JS sourcemap
}
````
The target browsers are set using Shopify's supported browserslist. This requires a few NodeJS Modules.
If used as is, do not forget to use install them by using the following npm install command:

```shell
npm i @shopify/browserslist-config esbuild-plugin-browserslist browserslist
```
You can refer to [esbuild's API build command documentation](https://esbuild.github.io/api/#build) for a more detailed overview of the available options.

**Watch Flag**
Using the watch flag, `--watch` or`-w`, will keep Archie running. Archie will monitor source folders and refresh your
build on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

## Installing your Collection

Installing your collection must be done from the [Theme](Themes.md) component. Please refer to that documentation.
