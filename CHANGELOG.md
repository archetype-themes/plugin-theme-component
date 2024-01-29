# Archetype Themes' CLI

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1]

### Changed

- License set to MIT to match Shopify CLI license

## [2.0.0]

### Changed

- Drop package.json functions https://github.com/archetype-themes/plugin-theme-component/pull/299
- archie name and executable renamed to component in order to match the plugin name.

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
- Components Tree filters out images

### Fixed

- Execution Time Logs for Styles and JS Processors restored
- Logger: Pino-Pretty is now displaying items in sync mode instead of async

## [1.9.1] - 2023-12-14

### Changed

- Timer is a proper object model now instead of a utility class.
- package tests now includes a check for cyclic redundancy.

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
- Components tree will try to list section items only. It will list everything only if no section entry is found.
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

- Excluded modulepreload tags from importmap's output

## [1.8.5] - 2023-11-24

### Fixed

- Git Clean Command burdens shopify theme dev with 100 deletes and re-uploads

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
- CLI scans all folders for Components, Sections and Snippets, enforced structure is removed
- Added a trace log level with pino, using silly log level as a proxy with Node.js

## [1.5.5] - 2023-09-02

### Changed

- feature: settings schema array is now merged by name key. Before they were only merged with the theme's data upon
  install.

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

- bug: When building Collection, sections Schema Locales were always used instead of section Storefront Locales

## [1.5.1] - 2023-08-29

### Fixed

- bug: render liquid commands that were within a liquid code block were not detected, therefore, not created nor built.

### Changed

- code: Snippets are now tied to Components as child elements. They were previously tied to Render model instances.

### Removed

- code: Render model and Render Factory were removed. They were originally needed for snippet inlining.

## [1.5.0] - 2023-08-22

### Added

- Locales: JS files input now accepted.
- Schemas: JS files input now accepted.

### Fixed

- Storefront Locales and Schema Locales from snippets overwrite each other.

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
  sub-folder. Current Themes located in the src folder will need to add component.componentPath="src" to their
  package.json
  configuration. This closes #20
- Section Schema: Section Schema now handles enabled_on and disabled_on missing additional properties. This closes #59

### Changed

- Workflow: PR Test workflow now also checks for proper code linting and circular dependencies.
- SVG: SVGO config is now cached, preventing it from being loaded for every single svg file.
- Internal: ComponentFilesUtils was moved to its proper location, the utils folder
- Internal: Main sub-folder created in src to regroup all main components.

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

- Snippets inlining is disabled, files are now copied individually.
- Section liquid files are not built in the section folder anymore on collection commands, there is no need.

### Removed

- Sass handling items for mixing sass & postcss. This is not allowed anymore.

## [1.2.3] - 2023-05-19

### Changed - External and Shareable Automated Node.js Package Publication

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

- NPM: Node engine version required was bumped to the current LTS version
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
