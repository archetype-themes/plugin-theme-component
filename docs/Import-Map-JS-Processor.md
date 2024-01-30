# Import Maps

It's a web platform standard that allows you to reference JavaScript modules using logical names. [Learn more](https://github.com/WICG/import-maps).

## ImportMapProcessor

It's a script that builds the importmap and module-preload tags for the components in a given collection.
The generated result is a snippet that can be included in Shopify Themes.

This is the default JavaScript processor in @archetype-themes/plugin-theme-component.

## Usage

1. Add an `importmap.json` file at the root of your collection to define all the `imports` that can be used across components. Module specifiers with wildcards are accepted. JavaScript modules can resolve from URLs or globs.

```
{
  "imports": {
    "canvas-confetti": "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.0/dist/confetti.browser.min.js",
    "scripts/helpers/*": "scripts/helpers/*.js",
    "components/*": "components/**/*.js"
  }
}

```

2. Create JS entry points for your components as needed.

```
components/
├─ my-component/
│  ├─ assets/
│  │  ├─ my-component.js
```

Example

```
// my-component.js
import confetti from 'canvas-confetti'
```

Result

```
// snippets/import-map.liquid
<script type="importmap">
{
  "imports": {
    "components/my-component": "{{ 'my-component.js' | asset_url }}",
    "canvas-confetti": "{{ 'confetti.browser.min.js' | asset_url }}"
  }
}
</script>
<link rel="modulepreload" href="{{ 'my-component.js' | asset_url }}">
<link rel="modulepreload" href="{{ 'confetti.browser.min.js' | asset_url }}">
```
