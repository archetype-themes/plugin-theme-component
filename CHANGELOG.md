# Archie Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2023-06-08

### Added

- settins_schema.json is now handled, merged and installed by archie.

## [1.3.1] - 2023-06-08

### Added

- New Timer Utility library for time stats avoiding duplicate code and removing legacy code, now using hrtime.bigint()
  instead of legacy hrtime().

### Changed

- Separation of concerns: Decoupled build methods. Collection, Section and Snippet's build methods are not intertwined
  anymore.
- Separation of concerns: Timer code now exclusively in CLI calls, removed from factory and builder libraries.
- Use of Optional chaining for "if" conditions checking for an array property's existence and then validating the length
  property now replaces double if condition check.
- Separation of concerns: SnippetBuilder and Snippet Build are back in a simplified manner. They are needed only for svg
  transformation in liquid code.
- Duplicated code: SectionFactory.js and SnippetFactory.js common bits joined in ComponentFilesUtils.js

### Fixed

- Locale contents were not loaded for snippets

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

### Changed - External and Shareable Automated NodeJS Package Publication

- CI: Automated NodeJS package publishing is now external and can be shared with Next and other repositories.

## [1.2.2] - 2023-05-16 - Automated NodeJS package publication

### Added

- CI: Automated NodeJS package publishing upon version change in package.json file.

## [1.2.1] - 2023-05-16 - Error Handling Improvements

### Changed

- Code: Improved error handling by adding multiple custom error classes and using them throughout the code to replace
  use of the generic NodeJS Error class.

## [1.2.0] - 2023-05-10 - External PostCSS and ESBuild Configurations

## [1.1.0] - 2023-04-03 - PostCSS Integration Revised and Improved

### Added

- Tests: Tests now check for circular dependency with dpdm

### Changed

- Styles: PostCSS now uses external config instead of Archie internal hardcoded config.

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
- Documentation: Clarified Archie's mission and added "main benefits" list on the main README.md
- Documentation: Added GitHub Package Repository setup link in Prerequisites
- Documentation: Modified NPM command examples to use the GitHub Package Repository
- Documentation: Modified archie commands to use npx prefix
- Documentation: Updated limitations, linking to actual issues in the Archie GitHub project.
- Documentation: Contributing section now details the code structure. All folders and phases of build are now explained.
- Documentation: Sections and Snippet Components now contain multiple examples of different-size components with
  different file structures and strategies.
- Documentation: Setup documentation now gives you the option of using nvm or Homebrew to set up NodeJS

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

- Snippets: Archie now handles tilde in opening and closing liquid tags.
- Snippets: Archie will now handle all characters possible within quotes instead of just letters.

## [1.0.1] - 2022-10-20 - Initial Release

Archie's Initial Release
