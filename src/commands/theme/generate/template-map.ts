/**
 * This command generates a template map for component routes in the templates directory.
 *
 * - Reads all liquid files in the templates directory recursively
 * - Creates a template map object with the component name and route template
 * - Writes the template map to snippets/template-map.liquid
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'

export default class GenerateTemplateMap extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { default: '.', required: false })
  ])

  static description = 'Generate a template map for component routes in the templates directory'

  async run() {
    const themeDir = path.resolve(process.cwd(), this.args[Args.THEME_DIR])
    const templatesDir = path.join(themeDir, 'templates')
    const snippetsDir = path.join(themeDir, 'snippets')

    // Check if directories exist
    if (!fs.existsSync(templatesDir)) {
      this.error('Templates directory not found. Please ensure you are in a theme directory.')
    }

    if (!fs.existsSync(snippetsDir)) {
      this.error('Snippets directory not found. Please ensure you are in a theme directory.')
    }

    // Get all liquid files in templates directory recursively
    const getFiles = (dir: string): string[] => {
      const files = fs.readdirSync(dir)
      const result: string[] = [];

      for (const file of files) {
        const filePath = path.join(dir, file)
        if (fs.statSync(filePath).isDirectory()) {
          result.push(...getFiles(filePath));
          continue;
        }

        if (file.endsWith('.liquid') || file.endsWith('.json')) {
          result.push(filePath);
        }
      }

      return result;
    }

    const liquidFiles = getFiles(templatesDir)

    // Create template map object
    const templateMap = Object.fromEntries(
      liquidFiles.map(file => {
        const [category, componentName] = path.basename(file, '.liquid').split('.')
        if (!componentName) return [] // Skip if no component name

        const routeTemplate = this.getRouteTemplate(category)
        const fullRoute = `${routeTemplate}?view=${componentName}`
        return [
          componentName,
          { [category]: fullRoute }
        ] as [string, Record<string, string>]
      }).filter((entry): entry is [string, Record<string, string>] => entry.length > 0)
    )

    // Merge entries with the same component name
    const mergedTemplateMap: Record<string, Record<string, string>> = {};

    for (const [component, routes] of Object.entries(templateMap)) {
      if (typeof routes === 'object' && routes !== null) {
        mergedTemplateMap[component] = mergedTemplateMap[component]
          ? { ...mergedTemplateMap[component], ...routes }
          : routes;
      }
    }

    // Write the template map to snippets/template-map.liquid
    const liquidQuery = `
      {% assign product_url = '' %}
      {% if product %}
        {% assign product_url = product.url %}
      {% else %}
        {% for collection in collections %}
          {% assign first_product = collection.products.first %}
          {% if first_product %}
            {% assign product_url = first_product.url %}
            {% break %}
          {% endif %}
        {% endfor %}
      {% endif %}
    `

    const templateMapContent = `${liquidQuery}\n<script type="application/json" data-template-map>${JSON.stringify(mergedTemplateMap, null, 2)}\n</script>`
    if (!fs.existsSync(path.join(snippetsDir, 'template-map.liquid')) || fs.readFileSync(path.join(snippetsDir, 'template-map.liquid'), 'utf8') !== templateMapContent) {
      fs.writeFileSync(path.join(snippetsDir, 'template-map.liquid'), templateMapContent)
    }

    if (!this.flags[Flags.QUIET]) {
      this.log('Successfully generated template map at snippets/template-map.liquid')
    }
  }

  // Get route template based on category
  private getRouteTemplate(category: string): string {
    switch (category) {
      case '404': {
        return '{{ routes.root_url }}'
      }

      case 'article': {
        return '{{ article.url }}'
      }

      case 'blog': {
        return '{{ blog.url }}'
      }

      case 'cart': {
        return '{{ routes.cart_url }}'
      }

      case 'collection': {
        return '{{ collections.first.url }}'
      }

      case 'customers/account': {
        return '{{ routes.account_url }}'
      }

      case 'customers/activate_account': {
        return '{{ routes.account_url }}'
      }

      case 'customers/addresses': {
        return '{{ routes.account_addresses_url }}'
      }

      case 'customers/login': {
        return '{{ routes.account_login_url }}'
      }

      case 'customers/order': {
        return '{{ customer.order_url }}'
      }

      case 'customers/register': {
        return '{{ routes.account_register_url }}'
      }

      case 'customers/reset_password': {
        return '{{ routes.account_recover_url }}'
      }

      case 'gift_card': {
        return '{{ gift_card.url }}'
      }

      case 'index': {
        return '{{ routes.root_url }}'
      }

      case 'list-collections': {
        return '{{ routes.collections_url }}'
      }

      case 'page': {
        return '{{ page.url }}'
      }

      case 'password': {
        return '{{ routes.root_url }}'
      }

      case 'product': {
        return '{{ product_url }}'
      }

      case 'search': {
        return '{{ routes.search_url }}'
      }

      default: {
        return '{{ routes.root_url }}'
      }
    }
  }
}
