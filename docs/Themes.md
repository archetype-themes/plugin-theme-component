# Archie Themes

Archie Theme is any standard Shopify Theme is a component type used within Archie to define a standard Shopify Theme.
Archie enhances Shopify Themes by
enabling installation of one or more Archie Collections.

## Configuring your theme to use Archie

Using Archie allows you to easily install an "Archie Collection" within your Theme.

### Adding a Collection

You need to install Archie along with your Collection, Archie is the tool that will allow you to install the
Collection's code within your theme files.

```shell
# Add Archie
cd ~/projects/[theme-folder]
npm install @archetype-themes/archie --save-dev

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

Next, you will need to edit your package.json to add the archie configuration element, at the location of your choice

* Make sure you indicate your `type` as a **"theme"**
* *Optional:* Follow with `path` to point to your theme source files if they are not at the root folder of the
  repository.
* *Optional:* Include a list of sections from your collection for a partial install
* *Optional:* Create shortcuts to archie commands in the scripts section

```json
{
  "archie": {
    "type": "theme",
    "path": "./src",
    "my-awesome-collection": [
      "section-one",
      "section-two",
      "section-four"
    ]
  },
  "scripts": {
    "ai": "archie install",
    "aw": "archie install --watch"
  }
}
```

### Install your collection

The **"install"** command run a fresh build of your collection and installs it within your Theme.

```shell
# If you want to use archie manually, you should use "npx"
npx archie install

# If you created a shortcut script, you should use "npm run"
npm run ai

```

**Watch Flag**

Using the watch flag, `--watch` or`-w`, will keep Archie running. Archie will monitor the collection's source folders
and refresh your install on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

```shell
# If you want to use archie manually, you should use "npx"
npx archie install --watch

# If you created a shortcut script, you should use "npm run"
npm run aw
```

---

The newly added files should look something like that:

```shell
# Collection Styles
src/assets/[my-awesome-collection].cs
# Collection JavaScript
src/assets/[my-awesome-collection].js

# Collection Sections
src/sections/[section-one].liquid
src/sections/[section-two].liquid

# Collection Snippets (only if invoked as a for loop)
src/snippets/[snippet-one].liquid
```

The following files will be edited or created if need be:

```shell
# Adding JavaScript and Styles references if needed
src/layout/theme.liquid
```
