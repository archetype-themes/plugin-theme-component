# Explorer Theme

The Explorer theme is used in conjunction with the [Shopify CLI Theme Component Plugin] to create an isolated development and test environment for Theme Components inside of the Shopify Theme Editor.

![2023-11-09 15-25-05](https://github.com/archetype-themes/explorer/assets/4837696/e23acff7-7c28-45e4-923b-5478881013f2)

## How it works

Use the `shopify theme component dev [component-name]` command inside of a component collection like [archetype-themes/components]() to bootstrap your component development environment. 

This command does the following operations:
1. Copy the contents of `archetype-themes/explorer` repo into the `.explorer` directory
2. Copy setup files located in `components/[component]/setup/[templates|sections]` into their respective directories in the `.explorer` directory
3. Copy component build files `assets|locales|snippets` into their respective directories in the `.explorer` directory
4. Runs `shopify theme dev` on the `.explorer` directory

