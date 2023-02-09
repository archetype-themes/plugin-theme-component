# Contributing to Archie

All contributions are welcome. To Contribute, simply create a branch, commit your code, and create a pull request.

## Prerequisites

Please make sure you have followed the [Setup Guide](Setup.md)

## Install Archie

First, checkout the code from [Archie repository](https://github.com/archetype-themes/archie) and make it available
globally as a linkable local package.

```shell

# Link your local install of archie
cd ~/projects
git checkout https://github.com/archetype-themes/archie.git

# Make archie available globally as a linkable local package
cd archie
npm link
```

Then install Archie within a collection and/or a theme as a local folder dependency. Before doing so, you might have to
remove your standard remote archie install.

```shell
# Remove previous remote install where needed
cd ~/projects/[collection-repo|theme-repo]
npm uninstall @archetype-themes/archie

# Link your repository to your shared archie local copy
npm link @archetype-themes/archie

# Alternatively If you are in a theme workspace, you might want to use this command instead
npm link @archetype-themes/archie --workspace=[worskspace-folder/workspace-name]
```

Please note this does not alter you package.json file.

Use the following commands to manage your links:

```shell
# View current repository's links
cd ~/projects/[collection-repo|theme-repo]
npm ls --link

# View you globally linkable repositories
npm ls --link --global

# Unlink archie from your collection or theme repository
cd ~/projects/[collection-repo|theme-repo]
npm unlink @archetype-themes/archie

# Disable the link functionality on your local archie folder
cd ~/projects/archie
npm unlink
```

## Contributing to the development of Archie

You should consult the [Archie Project](https://github.com/orgs/archetype-themes/projects/43) in GitHub. You will see
the cycle plannings. Tickets should list upcoming features and backlog.

Assign yourself a ticket and reach out to us if you have questions. Create a branch for your development. Create a Pull
Request for your code to be merged into the main branch.

## Fixing Bugs

Check the [bug issues panel](https://github.com/archetype-themes/archie/issues?q=is%3Aopen+is%3Aissue+label%3Abug) to
view current bugs. Assign yourself one and create a branch for your fix. Create a Pull Request for your fix to be
merged into the main branch.
