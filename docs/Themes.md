# Themes

A Theme is a component type used by the CLI to identify a standard Shopify Theme. The CLI enhances Shopify Themes by
enabling installation of one or more Component Collection.

## Configuring your theme to use the CLI

Using the CLI allows you to easily install a Collection within your Theme.

### Adding a Collection

You need to install the CLI along with your Collection. The CLI will allow you to install the Collection's code within
your theme files.

```shell
# Add The CLI
cd ~/projects/[theme-folder]
npm install @archetype-themes/plugin-theme-component --save-dev

# Add a finalized collection from GitHub
cd ~/projects/[theme-folder]
npm install @archetype-themes/[my-awesome-collection] --save-dev

# ALTERNATIVELY: Add your work-in-progress local collection from a local folder
cd ~/projects/[collection-folder]
npm link

cd ~/projects/[theme-folder]
npm link [collection-namespace]/[collection-name]

```

### Node Package Configuration

Next, you will need to edit your package.json to add the component configuration element, at the location of your choice

* Make sure you indicate your `type` as a **"theme"**
* *Optional:* Follow with `path` to point to your theme source files if they are not at the root folder of the
  repository.
* *Optional:* Include a list of components from your collection for a partial installation
* *Optional:* Create shortcuts to the CLI commands in the scripts section

```json
{
  "component": {
    "type": "theme",
    "path": "./src",
    "my-awesome-collection": [
      "component-one",
      "component-two",
      "component-four"
    ]
  },
  "scripts": {
    "ai": "component install",
    "aw": "component install --watch"
  }
}
```

### Install your collection

The **"install"** command runs a fresh build of your collection and installs it within your Theme.

```shell
# If you want to use plugin-theme-component manually, you should use "npx"
npx component install

# If you created a shortcut script, you should use "npm run"
npm run ai

```

**Watch Flag**

Using the watch flag, `--watch` or`-w`, will keep the CLI active and monitor the collection's source folders
and refresh your installation on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

```shell
# If you want to use plugin-theme-component manually, you should use "npx"
npx component install --watch

# If you created a shortcut script, you should use "npm run"
npm run aw
```

---

The newly added files should look something like that:

```shell
# Collection Styles
assets/[collection-name].cs
# Collection JavaScript
assets/[collection-name].js

# Collection Components
snippets/[component-one].liquid
snippets/[component-two].liquid

# Collection Snippets
snippets/[snippet-one].liquid
```

The following files will be edited or created if needed:

```shell
# Adding JavaScript and Styles references if needed
layout/theme.liquid
```
