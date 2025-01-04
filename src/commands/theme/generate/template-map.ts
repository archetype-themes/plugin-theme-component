import * as fs from 'fs'
import * as path from 'path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'

export default class GenerateTemplateMap extends BaseCommand {
  static description = 'Generate a template map for component routes in the templates directory'

  static override args = Args.getDefinitions([
    Args.override(Args.THEME_DIR, { required: false, default: '.' })
  ])

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
      return files.reduce<string[]>((acc, file) => {
        const filePath = path.join(dir, file)
        if (fs.statSync(filePath).isDirectory()) {
          return [...acc, ...getFiles(filePath)]
        }
        if (file.endsWith('.liquid') || file.endsWith('.json')) {
          return [...acc, filePath]
        }
        return acc
      }, [])
    }

    const liquidFiles = getFiles(templatesDir)

    // Create template map object
    const templateMap = Object.fromEntries(
      liquidFiles.map(file => {
        const relativePath = path.relative(templatesDir, file)
        const [category, componentName] = path.basename(file, '.liquid').split('.')
        if (!componentName) return [] // Skip if no component name

        // Generate the route based on the category
        let routeTemplate = ''
        switch (category) {
          case '404':
            routeTemplate = '{{ routes.root_url }}'
            break
          case 'article':
            routeTemplate = '{{ article.url }}'
            break
          case 'blog':
            routeTemplate = '{{ blog.url }}'
            break
          case 'cart':
            routeTemplate = '{{ routes.cart_url }}'
            break
          case 'collection':
            routeTemplate = '{{ collections.first.url }}'
            break
          case 'customers/account':
            routeTemplate = '{{ routes.account_url }}'
            break
          case 'customers/activate_account':
            routeTemplate = '{{ routes.account_url }}'
            break
          case 'customers/addresses':
            routeTemplate = '{{ routes.account_addresses_url }}'
            break
          case 'customers/login':
            routeTemplate = '{{ routes.account_login_url }}'
            break
          case 'customers/order':
            routeTemplate = '{{ customer.order_url }}'
            break
          case 'customers/register':
            routeTemplate = '{{ routes.account_register_url }}'
            break
          case 'customers/reset_password':
            routeTemplate = '{{ routes.account_recover_url }}'
            break
          case 'gift_card':
            routeTemplate = '{{ gift_card.url }}'
            break
          case 'index':
            routeTemplate = '{{ routes.root_url }}'
            break
          case 'list-collections':
            routeTemplate = '{{ routes.collections_url }}'
            break
          case 'page':
            routeTemplate = '{{ page.url }}'
            break
          case 'password':
            routeTemplate = '{{ routes.root_url }}'
            break
          case 'product':
            routeTemplate = '{{ product_url }}'
            break
          case 'search':
            routeTemplate = '{{ routes.search_url }}'
            break
          default:
            routeTemplate = '{{ routes.root_url }}'
        }

        const fullRoute = `${routeTemplate}?view=${componentName}`
        return [
          componentName,
          { [category]: fullRoute }
        ] as [string, Record<string, string>]
      }).filter((entry): entry is [string, Record<string, string>] => entry.length > 0)
    )

    // Merge entries with the same component name
    const mergedTemplateMap = Object.entries(templateMap).reduce<Record<string, Record<string, string>>>((acc, [component, routes]) => {
      if (typeof routes === 'object' && routes !== null) {
        acc[component] = acc[component] ? { ...acc[component], ...routes } : routes
      }
      return acc
    }, {})

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

    const templateMapContent = `<script type="application/json" data-template-map>\n${liquidQuery}\n${JSON.stringify(mergedTemplateMap, null, 2)}\n</script>`
    if (!fs.existsSync(path.join(snippetsDir, 'template-map.liquid')) || fs.readFileSync(path.join(snippetsDir, 'template-map.liquid'), 'utf8') !== templateMapContent) {
      fs.writeFileSync(path.join(snippetsDir, 'template-map.liquid'), templateMapContent)
    }

    this.log('Successfully generated template map at snippets/template-map.liquid')
  }
}
