# Archie Sections

## Sections Structure

[Within an Archie Collection, you can create a section](Using-a-Collection.md#creating-an-archie-section-within-your-collection)
. This will generate a basic section folder structure and some template code. This reflects the structure of a standard
Archie Section. Let's take a look.

```shell
.
├── README.md
├── package.json
└── src
    ├── locales
    │   ├── locales.json
    │   └── locales.schema.json
    ├── schema.json
    ├── scripts
    │   └── index.js
    ├── snippets
    ├── some-smart-section-name.liquid
    └── styles
        └── main.scss
```

### package.json

Your standard node package.json with a few presets to help archie understand what type of component this is.

### README.md

This Readme file is intended for Theme Developers using your Section. Help them integrate your Section by giving them a
few pointers. Here are a few topics you could address in there.

- What's your Section's name, function and purpose?
- What settings are available?
- When was it first released?
- What features were added, and when.

### The Sources folder

All project files are located in a sub-folder named **"src"**", Later on, transformations to your files will occur
through Archie in a build process, creating a new **"build"**" sub-folder to that effect.

#### Your section's liquid file

Typical liquid file for your section's content.

#### schema.json

Growing tired of reaching at the bottom of your liquid file to edit your Section's JSON schema? Then let's take it out!

You can use an external schema.json file to isolate it from your liquid/html code. Archie's build process will take care
of the rest.

#### JavaScript

Start your section's JavaScript code with an index.js|mjs file and code modern JavaScript, Archie takes care of the
rest.

**Good practice:**

- Include JavaScript librairies as yarn dependencies for your section.
- If multiple Sections share some internal JS code, put that code in a Node Module in a separate GitHub repo and include
  it with yarn with ``yarn add some-shared-js-module@archetype-themes/some-shared-js-module``.

#### Styles

Start writing your section's styles in a main.css|less|sass|scss file. Include additional sheets from there and Archie
takes care of the rest.

Caveat: At the moment, there is no check for duplicate CSS styles and shared librairies.

#### Locale Files: the Archie way

Tired of managing a huge number of locale files with a never ending scroll to reach your section? Isolate your section's
translations and regroup all your locales in one file with **archie**!

Storefront locales can be brought together in ``src/locales/locales.json`` in a simplified structure. This is also
available for Schema under``src/locales/locales.schema.json``. The structure hierarchy is a parent locale with children
descriptions and their translations.

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

#### Snippets folder

Reusable Snippets should be external to your Section. If there is no use case where a minimalistic Snippet would be used
in another section, feel free to keep it in the appropriate snippets folder for ease of use.

## Section commands

### Build a Section

Building a section from its root folder is pretty simple with Archie, just run

```shell
archie build section
```

If you are one level up, that is, inside the parent Collection folder, you need to specify the section's name.

```shell
archie build section some-smart-section-name
```

### Watch a Section

If you are working on a section and want to continuously build it on file change, use the watch command instead:

```shell
# From the section's root folder
archie watch section

# From the Collection's root folder
archie build section some-smart-section-name
```

Use Ctrl+C to stop watching the files for changes.

## Install a Section

When part of a collection, a section can be installed within a Shopify Theme. Please read the [Themes](Themes.md)
documentation to learn more.
