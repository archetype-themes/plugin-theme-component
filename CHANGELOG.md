# Archetype Themes' CLI

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.4] - 2024-05-17

### Changed

- Install path for external components is now systems temp folders instead of .collections or .locales folders
- GitUtils: git clone now validates that we have auth information for private repos and automatically adds basic HTTPS
  auth when needed from env vars
- GitUtils: Now handles git operations for CLI and tests instead of having two separate processes

### Fixed

- Tests: Tests were failing because of the user email prompt
- Tests: Tests were failing because of GitHub authentication issues

## [3.3.3] - 2024-05-15

### Added

- Generate: Boilerplate test folders and files.

### Changed

- Dependencies: Minor updates

## [3.3.2] - 2024-05-07

### Changed

- oclif Init Hook: Request User email text updated
- oclif Init Hook: Now only triggers on our plugin commands.

### Fixed

- Generate: The component name did not replace the 'component-name' term in the JS file name.
- Dev: Error when specifying a component name

### Removed

- NPM Install Hook: Request User email for DevKit Newsletter Subscription #417

## [3.3.1] - 2024-05-07

### Fixed

- Liquid syntax error with parenthese in explorer's index template file

### Removed

- Reference to favicon component

## [3.3.0] - 2024-05-06

### Added

- NPM Install Hook: Request User email for DevKit Newsletter Subscription #417
- oclif Init Hook: Request User email for DevKit Newsletter Subscription #417

### Changed

- Dependencies: Minor updates & oclif version alignment with Shopify CLI release 3.6.0

## [3.2.5] - 2024-05-06

### Added

- MIT LICENSE for repository

### Changed

- Reformatted some explorer files and replace the original color scheme approach

## [3.2.4] - 2024-05-01

### Fixed

- Dev CMD: Changing the theme layout file now triggers an update of the components' main CSS file reference
- Dev CMD: Changing the theme index template file with setupFiles enabled now updates the component list
- Dev CMD: When using setup files, the Index Template is adjusted in the explorer folder instead of in the source
  folder.
- Dev CMD: Added missing template routes URL from the explorer setup files index
- CI/CD: Git automated version tag on version bump is repaired

### Changed

- Contributing doc moved to root and revised (WIP)
- Dev CMD: Explorer files UI implementation
- Install CMD: Default components are now pointing to reference-components instead of components
- NPM config set to publish to NPM instead or GitHub registry
- NPM package @archetype-themes package scope removed
- GitHub Action set to publish to NPM instead or GitHub registry

### Removed

- Outdated docs

## [3.2.3] - 2024-04-15

### Changed

- External explorer repository files are now integrated in the resources folder
- Reference Theme replaces Explorer as the default Theme
- Dev Command: The setup-files flag is now exclusive to the explorer files.
- Automated husky actions: npm ci replaced with npm i for faster results.
- Updated dependencies

## [3.2.2] - 2024-04-04

### Changed

- Clone repos to temporary folders (#386)

## [3.2.1] - 2024-03-27

### Fixed

- Dev command: setup-files copy was only functional when paired with watch functionality

### Changed

- Multiple file copy operations now benefit from automated folder creation beforehand

## [3.2.0] - 2024-03-25

### Added

- Dev command: The setup-files flag is now functional. Setup files are copied in the theme folder (#322)
- Dev command: Displays time of day upon completion (#367)
- Install command: Displays time of day upon completion (#367)

## [3.1.2] - 2024-03-20

### Fixed

- Dev command: Changed JS assets do not refresh on partial builds (#373)
- Tests: We now delete the shopify.theme.toml file from checked-out repos to avoid constant test failure due to invalid
  custom values overriding defaults.

### Removed

- Obsolete pino logger dependencies

## [3.1.1] - 2024-03-19

### Fixed

- Changed locales do not update upon install
- Restoring the @archetype-themes package namespace to resolve automated GitHub npm package publishing issues

### Removed

- Obsolete vitest dependency
- Obsolete vitest config file

## [3.1.0] - 2024-03-14

### Added

- Diff on files before writing to disk

### Changed

- partial builds on watch events instead of full builds

## [3.0.0] - 2024-03-08

### Added

- Dev command: Component arg now handles multiple component names
- Dev command: New locales-path flag => Allows for a path to locale files to be specified manually
- Dev command: New theme-path flag => Allows for a path to theme files to be specified manually
- Dev command: New setup-files flag => A boolean flag to enable setup files copy
- Dev command: New watch flag => This functionality will watch for changes in the components, locales and theme folders
- Git Hooks: Automatically run "npm ci" after git merge and checkout actions
- Git Hooks: Automatically run "npm ci" after git merge and checkout actions

### Changed

- code: Logger cleanup: All recently added log utility functions were moved to a new file: LoggerUtils.js
- code: Utility libraries now adopt a Node.js typical, non-object-oriented architecture
- code: The oclif and Archie commands are now merged under src; the plugins folder is gone.
- code: model properties are now public, non-transformative getter and setters were removed
- lint: now using eslint with standard JS and prettier plugin
- toml config - dev command: The toml config properties were renamed to match the new command flag names.
- toml config - dev command: The toml config file is now optional.
- toml config - dev command: The new command flags have priority over toml values
- toml config - dev command: All config options have default values through command flag default values
- logs: replaced pino logs with @oclif/core's ux functions (mocha and pino-pretty didn't play well together)

### Fixed

- Unrecognized main stylesheet when using a [component-name].css name while having multiple stylesheets in a single
  component
- Missing Theme Name on Install: Now guessing theme name by using cwd since package.json was removed

### Removed

- Install command: Removed watch option. Use the Dev command's new features instead.

## [2.3.1] - 2024-02-14

### Fixed

- Stylesheet filename fix https://github.com/archetype-themes/plugin-theme-component/pull/337

## [2.3.0] - 2024-02-01

### Added

- Opinionated PostCSS Config https://github.com/archetype-themes/plugin-theme-component/pull/328

## [2.2.0] - 2024-02-01

### Added

- Main Component Command with a Version flag
- Error Handling on missing toml file

### Removed

- Paired with shopify theme dev functionality.
- Build Command (obsolete)
- Generate Command (temporary)

## [2.1.1] - 2024-01-31

### Added

- Install functionality is now paired with shopify theme dev functionality.

### Fixed

- Install functionality fully restored

## [2.1.0] - 2024-01-30

### Added

- Shopify CLI theme dev is run automatically in sync with our component dev command

## [2.0.4] - 2024-01-30

### Changed

- oclif commands call the plugin commands directly, not through npx spawned thread

### Fixed

- Add the omitted watch flag for the oclif install command
- Add missing trace/debug flags

## [2.0.3] - 2024-01-29

### Changed

- Moved @types/node dependency for oclif compliance as a dependency

## [2.0.2] - 2024-01-29

### Added

- Added @types/node dependency for oclif compliance as a dev dependency

## [2.0.1] - 2024-01-29

### Changed

- License set to MIT to match Shopify CLI license

## [2.0.0] - 2024-01-29

### Changed

- Drop package.json functions https://github.com/archetype-themes/plugin-theme-component/pull/299
- archie name and executable renamed to "component" to match the plugin name.

### Fixed

- Repo paths fix https://github.com/archetype-themes/plugin-theme-component/pull/301
- Undefined content fix on builds with no styles https://github.com/archetype-themes/plugin-theme-component/pull/309

## [1.9.7] - 2024-01-17

### Changed

- Update plugin's name https://github.com/archetype-themes/plugin-theme-component/pull/298

## [1.9.6] - 2024-01-16

### Changed

- Install collections defined via shopify.theme.toml https://github.com/archetype-themes/plugin-theme-component/pull/297

## [1.9.5] - 2024-01-10

### Changed

- Handle shopify.theme.toml configuration file https://github.com/archetype-themes/plugin-theme-component/pull/291

## [1.9.4] - 2024-01-08

### Added

- Shopify CLI plugin integration ([#272](https://github.com/archetype-themes/plugin-theme-component/pull/272))

### Fixed

- Process locale files only ([#289](https://github.com/archetype-themes/plugin-theme-component/pull/289))

## [1.9.3] - 2023-12-20

### Changed

- Create command has been renamed to the generate command

## [1.9.2] - 2023-12-14

### Changed

- Missing Translation Warnings are now in alphabetical order and deduplicated
- THe component tree now filters out images

### Fixed

- Execution Time Logs for Styles and JS Processors restored
- Logger: Pino-Pretty is now displaying items in sync mode instead of async

## [1.9.1] - 2023-12-14

### Changed

- Timer is a proper object model now instead of a utility class.
- The package tests now include a check for cyclic redundancy.

## [1.9.0] - 2023-12-14

### Added

- New locales process compares external DB to translate tags in liquid to dynamically generate the final files. #180
- Session.firstRun implemented to avoid repetitive time-consuming tasks in watch mode
- Component Model now has a utility method isSvg() to detect if it is an SVG icon
- Collection Model now has a utility get method allComponents that returns components and snippets as one single array

### Changed

- Render Tags detection is back to using regular expressions; liquid-html-parser offers bad performance on 100+
  components
- Updated dependencies
- Renaming FileUtils.writeFile to FileUtils.saveFile to avoid name conflict with Node.js
- The component tree will try to list section items only. It will list everything only if no section entry is found.
- FileUtils.js installExternalComponent was moved to its own Utils file to avoid circular dependencies.
- PinoPretty as a stream was lagging, using it in sync.

### Removed

- Esbuild Processor and dependencies
- Unused Sass dependencies
- Newly unused liquid-html-parser dependency

## [1.8.8] - 2023-11-27

### Fixed

- Missing Snippet: Improve error message #172

## [1.8.7] - 2023-11-27

### Fixed

- CLI fails on missing snippets folder on theme install #255

### Changed

- Updated dependencies

## [1.8.6] - 2023-11-26

### Changed

- Excluded modulepreload tags from the importmap output

## [1.8.5] - 2023-11-24

### Fixed

- The Git Clean Command burdens shopify theme dev with 100 files deletion and re-uploads

## [1.8.4] - 2023-11-22

### Changed

- Removed forgotten console.log statement

## [1.8.3] - 2023-11-22

### Changed

- Improve LiquidParser Error Handling #254
- Updated dependencies

## [1.8.2] - 2023-11-21

### Fixed

- Ignore Commented Liquid Code #173

## [1.8.1] - 2023-11-17

### Added

- Dev Command now also handles the complete collection

## [1.8.0] - 2023-11-16

### Added

- Dev Command

## [1.7.8] - 2023-11-13

### Fixed

- Install: Collection name appears as an object

## [1.7.7] - 2023-11-09

### Fixed

- Build: When a Component Name was provided, the Default Target Type Was Collection instead of Component

### Added

- Build: Now Throws an Error when No Components are found instead of finishing an empty build.

## [1.7.6] - 2023-11-07

### Fixed

- Install command is not copying the build files over to the theme.

## [1.7.5] - 2023-11-07

### Fixed

- Resolve import paths from collectionRootFolder

## [1.7.4] - 2023-11-07

### Changed

- Added .explorer, bin to ignore patterns so the build does not trigger during watch mode

## [1.7.3] - 2023-11-05

### Fixed

- Upon Theme Install, svgo config is not found
- Package Manifests from shared workspaces are scanned for components

### Changed

- Doc: Sections renamed to components
- Doc: Archie renamed to CLI (WIP)

### Removed

- Support for Section Component Type

## [1.7.2] - 2023-11-01

### Fixed

- Fixed the computation of gitignore patterns during watch
  mode ([#228](https://github.com/archetype-themes/plugin-theme-component/pull/228))

## [1.7.1] - 2023-10-31

### Changed

- Refactor Import map processor and add comments

## [1.7.0] - 2023-10-24

### Added

- Import map processor ([#214](https://github.com/archetype-themes/plugin-theme-component/pull/214))

## [1.6.4]

### Removed

- Removing Schema Locales support. Schema Locales will stay in the Theme for now.

## [1.6.3]

### Removed

- Removing Settings Schema support. Settings Schema will stay in the Theme for now.

## [1.6.2] - 2023-10-24

### Fixed

- Install missing dependencies

## [1.6.1] - 2023-10-24

### Fixed

- Fixed watch mode ([#215](https://github.com/archetype-themes/plugin-theme-component/issues/215))

## [1.6.0] - 2023-10-12

### Added

- Added Components support (WIP)
- CLI scans all folders for Components, Sections and Snippets; enforced structure is removed
- Added a trace log level with pino, using silly log level as a proxy with Node.js

## [1.5.5] - 2023-09-02

### Changed

- feature: The settings schema array is now merged by name key. They were only merged with the theme's data upon
  installation before.

## [1.5.4] - 2023-09-02

### Added

- documentation: Added documentation regarding SVG Snippets
- documentation: Added documentation regarding the postcss-import plugin

### Changed

- documentation: Mandatory `src` folder information replaced by an optional mention. It was also removed from some
  examples.

## [1.5.3] -2023-08-30

### Changed

- feature: embedding locales into a section structure is now optional and defaults to false.

## [1.5.2] - 2023-08-30

### Fixed

- bug: When building Collection, section Schema Locales were always used instead of section Storefront Locales

## [1.5.1] - 2023-08-29

### Fixed

- bug: render liquid commands that were within a liquid code block were not detected, therefore, not created nor built.

### Changed

- code: Snippets are now tied to Components as child elements. They were previously tied to Render model instances.

### Removed

- code: Render model and Render Factory were removed. They were originally needed for snippet in-lining.

## [1.5.0] - 2023-08-22

### Added

- Locales: JS files input is now accepted.
- Schemas: JS files input is now accepted.

### Fixed

- Storefront and Schema Locales from snippets overwrite each other.

### Changed

- Resources (component templates) do not use the 'src' folder anymore

## [1.4.7] - 2023-08-14

### Changed

- Updated templates for section/snippet creation

## [1.4.6] - 2023-08-04

### Fixed

- bug: #142 build js files do not handle dependencies properly.

### Changed

- code: (cleanup) JavaScriptProcessor.js util methods were moved to JavascriptUtils.js to match Styles' cleaner more
  recent file structure
- code: (cleanup) Removing further sass & less legacy support options.
- code: (SonarLint) string.match() replaced with RegExp.exec() for better performance
- code: (cleanup) Reduced Cognitive complexity and improved clarity for ComponentFilesUtils.filterFiles

## [1.4.5] - 2023-08-01

### Fixed

- bug:Section build conditions to create the snippets build folder were updated to be aligned with the recent snippets
  handling change (not inlined anymore)

### Changed

- NPM: Updated Node.js dependencies

## [1.4.4] - 2023-07-25

### Changed

- documentation: Node.js framework name corrected all throughout code comments and documentation
- typo: Typo corrected in the Changelog
- code: default null value removed for jsTemplateVariables argument. It was both confusing and unnecessary.

### Fixed

- bug: Schema Locales Build missing because of a missing await.

## [1.4.3] - 2023-07-17

### Fixed

- bug: Section build error on empty section.settingsSchema

### Changed

- Section Creation main template file now uses css extension instead of scss
- NPM: Updated Node.js dependencies

## [1.4.2] - 2023-07-05

### Changed

- NPM: Updated Node.js dependencies

## [1.4.1] - 2023-07-05

### Added

- NPM: Dependabot config for automated Node.js package updates

## [1.4.0] - 2023-06-29

### Added

- Settings Schema: settings_schema.json is now handled, merged and installed. This closes #44
- Install: ACTION REQUIRED: "component.componentPath" setting added in package.json, this allows for theme install in
  any
  folder. When not provided, this now defaults to the package's root folder rather than the previously hardcoded 'src'
  subfolder. Current Themes located in the src folder will need to add component.componentPath="src" to their
  package.json
  configuration. This closes #20
- Section Schema: Section Schema now handles enabled_on and disabled_on missing additional properties. This closes #59

### Changed

- Workflow: PR Test workflow now also checks for proper code linting and circular dependencies.
- SVG: SVGO config is now cached, preventing it from being loaded for every single svg file.
- Internal: ComponentFilesUtils was moved to its proper location, the utils folder
- Internal: Main subfolder created in src to regroup all main components.

### Removed

- Backup: Install Backup Functionality is removed, it will not be missed.

## [1.3.1] - 2023-06-08

### Added

- CLI: New Timer Utility library for time stats avoiding duplicate code and removing legacy code, now using
  hrtime.bigint()
  instead of legacy hrtime().

### Changed

- Separation of concerns: Decoupled build methods. Collection, Section and Snippet's build methods are not intertwined
  anymore.
- Separation of concerns: Timer code now exclusively in CLI calls, removed from factory and builder libraries.
- Code: Use of Optional chaining for "if" conditions checking for an array property's existence and then validating the
  length
  property now replaces double if condition check.
- Separation of concerns: SnippetBuilder and Snippet Build are back in a simplified manner. They are needed only for svg
  transformation in liquid code.
- Duplicated code: SectionFactory.js and SnippetFactory.js common bits joined in ComponentFilesUtils.js

### Fixed

- Locale contents were not loaded for snippets. This closes #79

## [1.3.0] - 2023-06-04

### Added

- Templates for new components
  - Added 'de', 'it', 'pt-BR' and 'pt-PT' locales
  - package.json now inherits "author", "license" and package scope from parent monorepo
  - package.json now includes repository information
- SVG Snippets are now processed through SVGO
- vitest is now installed as a test framework
- Tests for NodeUtils added

### Changed

- Snippets inlining are disabled, files are now copied individually.
- Section liquid files are not built in the section folder anymore on collection commands, there is no need.

### Removed

- Sass handling items for mixing sass & postcss. This is not allowed anymore.

## [1.2.3] - 2023-05-19

### Changed

- External and Shareable Automated Node.js Package Publication
- CI: Automated Node.js package publishing is now external and can be shared with Next and other repositories.

## [1.2.2] - 2023-05-16 - Automated Node.js package publication

### Added

- CI: Automated Node.js package publishing upon version change in package.json file.

## [1.2.1] - 2023-05-16 - Error Handling Improvements

### Changed

- Code: Improved error handling by adding multiple custom error classes and using them throughout the code to replace
  use of the generic Node.js Error class.

## [1.2.0] - 2023-05-10 - External PostCSS and ESBuild Configurations

## [1.1.0] - 2023-04-03 - PostCSS Integration Revised and Improved

### Added

- Tests: Tests now check for circular dependency with dpdm

### Changed

- Styles: PostCSS now uses external config instead of an internal hardcoded one.

## [1.0.7] - 2023-03-13 - External Template Files

### Changed

- Component Templates: Template files for creating new Sections and Snippets were hardcoded in the JavaScript source
  code. The contents are now in external template files using Javascript template string interpolation as a templating
  language. The templates and folder structure will be copied to new Sections or Snippets.
- Documentation: Updates regarding templates to reflect previous change. We now list the available variables inside the
  templates.

## [1.0.6] - 2023-03-08 - Documentation Additions and Clarifications.

### Added

- NPM: Tests now run standard to validate JS syntax
- NPM: Added repository property to package.json

### Changed

- NPM: The Node engine version required was bumped to the current LTS version
- Documentation: Clarified the mission and added "main benefits" list on the main README.md
- Documentation: Added GitHub Package Repository setup link in Prerequisites
- Documentation: Modified NPM command examples to use the GitHub Package Repository
- Documentation: Modified commands to use npx prefix
- Documentation: Updated limitations, linking to actual issues in the GitHub project.
- Documentation: Contributing section now details the code structure. All folders and phases of build are now explained.
- Documentation: Sections and Snippet Components now contain multiple examples of different-size components with
  different file structures and strategies.
- Documentation: Setup documentation now gives you the option of using nvm or Homebrew to set up Node.js

## [1.0.5] - 2023-02-14 - GitHub Packages Integration

### Added

- CI: A GiHub Action Was Added to Automate the creation of a GitHub Package when creating a new release.

## [1.0.4] - 2023-02-14 - Assets and PostCSS Features

This release is now integrated with Next and the Expanse theme.

### Added

- Assets: Images and any other assets in the "src/assets" folder are installed on the theme
- Styles: PostCSS Implementation

### Changed

- NPM: npm replaces yarn
- Code: Refactored a lot of code improving readability and facilitating improvements
- Code: Functional programming principles applied where possible

### Fixed

- Locales: Schema Locales output on build and install
- Snippets: Multiple Snippets Recursion Issues
- Code: Circular dependencies removed
- Backup: Install backup functionality is now optional

## [1.0.3] - 2022-11-22 - Render Tags Regex Improvements

### Added

- Snippets: We now handle tilde in opening and closing liquid tags.
- Snippets: We now handle all characters possible within quotes instead of just letters.

## [1.0.1] - 2022-10-20 - Initial Release

Initial Release
