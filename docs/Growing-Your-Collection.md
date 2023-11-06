# Growing Your Collection

A Components Collection is a Node.js Monorepo that regroups multiple Shopify
Theme [Snippet Components](Snippet-Components.md) as child repositories in their respective namespaces.

## Child Component Snippets

The main goal of owning a collection is to populate it with [Snippet Components](Snippet-Components.md). You should
store them in their workspace folder. You can manually create a one, or you can use the CLI to generate a skeleton one
for you, with some boilerplate code.

### Adding a new Component

```shell
npx archie create component [some-smart-component-name]
```

Template files will be populated under the `components/some-smart-component-name` folder.

Please refer to the [Snippet Components](Snippet-Components.md) guide for more details on their structure.

### The Template Files

The source template files are located under the [``resources/component-files``](../resources/component-files) folder.
The files will be copied as is into the newly created component folder.

The files contain variables in the form of JavaScript Template Strings. These variables will be replaced with their
actual value upon creation. The available variables are:

````javascript
${collectionName}   // The collection's name
${componentName}    // The component's name
${componentType}    // The component's type
${packageName}      // The component's NPM package name (including scope)
````

**Pro Tip:** As an Archetype Themes developer, you can edit these files to your liking. You can also add new files to
the [``resources/component-files``](../resources/component-files) folder, and they will be copied over to the new
component.

## Building your collection

```shell
npx archie build collection

# Use the watch flag to refresh the build when the source files change
npx archie build collection --watch
```

This will bundle your collection's components as snippets inside the **build** sub-folder.

**PostCSS Build Pro Tips:**
When using PostCSS, use of a PostCSS config file at the root of your Collection is recommended. The CLI will load it
through the use of [postcss-load-config](https://www.npmjs.com/package/postcss-load-config) and take it into
consideration when building a component, a collection or even when installing to a theme.

- Reference to some [postcss.config.js usage examples](https://github.com/postcss/postcss#usage)
- Reference to [available postcss process options](https://postcss.org/api/#processoptions)
- Reference to the active list
  of [available PostCSS plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md) or
  the [searchable catalog](https://www.postcss.parts/)

**JavaScript Pro Tips:**
The CLI uses a custom [Import Map JavaScript Processor](Import-Map-JS-Processor.md) to optimize JavaScript files
loading. Please see the documentation for more information.

**Watch Flag**
Using the watch flag, `--watch` or`-w`, will keep the CLI running, monitoring source folders and refreshing your build
on any source file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

## Installing your Collection

Please refer to the [Themes](Themes.md) documentation to learn more about installation.
