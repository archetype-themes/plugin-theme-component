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

* Make sure you indicate your componentType as a "theme"
* Optionally include a list of sections from your collection for a partial install
* Optionally create shortcuts to archie commands in the scripts section

```json
{
  "archie": {
    "componentType": "theme",
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

**Backup Flag**

Using the watch flag, `--backup` or`-b`, will create backups prior to modifying files. Backup files have timestamps in
their name to make them unique.

To exclude backup files from Git, use the following filter in your .gitignore file.

````gitignore
# Archie backup files *.yyyy-mm-dd_hh-mm-ss.*
*.[1-9][0-9][0-9][0-9]-[01][0-9]-[0123][0-9]_[1-2][0-9]-[0-6][0-9]-[0-6][0-9].*
````

**Watch Flag**

Using the watch flag, `--watch` or`-w`, will keep Archie running. Archie will monitor the collection's source folders
and refresh your install on any file change. You can stop the process by pressing **Ctrl+C** on your keyboard.

```shell
# If you want to use archie manually, you should use "npx"
npx archie install --backup
npx archie install --watch
npx archie install --watch --backup

# If you created a shortcut script, you should "npm run"
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

# Adding/editing Schema locales if needed
src/locales/[some-locale].schema.json
```
## Testing sections on a local version of Next

### Install theme dependencies 

Install dependencies at the core level + at the Expanse theme level

Expanse package.json will have Next and Archie packages as dev dependencies 

Running the regular gulp deploy (`gulp deploy`) commands should build theme files as usual.

—

### Linking to the Next repo

In your local **next** workspace, install the dependencies 

Run `npm link` 

Switch to the core workspace at the Expanse theme level

Run `npm link @archetype-themes/next`

This should link your local version of Next to the Expanse theme 

Now you can make changes in Next and test them in the theme 

In Next, make section migration changes

Run `npm run build` or `npm run watch` to run the Archie build command and it will build the sections listed inside of the package.json config

To see the sections listed, look for the archie property inside of your package.json config and then the collections object. Sections have been configured under a **next** collection.

Migrated sections are the following: "blog-posts", "scrolling-text", "advanced-content", "background-image-text", "faq", "contact-form", "featured-video", "footer-promotions", "image-compare", "collection-return", "countdown", "age-verification-popup", "logo-list" as of v0.13.0

Now that you’ve run the build successfully switch over to the Expanse theme workspace

A similar package.json next collection config can be found under “archie” in package.json 

Run `npm run archie` or `npm run archiew` to install the sections listed in the theme’s package.json into the Expanse theme 

Then run `npm run deploy` to build the theme files and deploy to the Shopify theme editor

If your `npm link` was successful you will be able to see local changes and test them in the editor. 

Otherwise you may just see results based on the next v0.13.0 package that was released and installed as a dependency. Try unlinking and link again to fix this.
