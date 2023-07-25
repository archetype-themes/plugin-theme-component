# Set up your workstation to be ready for Archie

## MacOS

### Installing NodeJS

Installing Node.js is necessary to use Archie. You can use Node Version Manager if you might need multiple different
versions of node on your system. You can use Homebrew to always have the latest stable version on your system. You can
also get binaries from the [node.js](https://nodejs.org/en/) website.

#### Using Node Version Manager

[nvm](https://github.com/nvm-sh/nvm) is a version manager for [node.js](https://nodejs.org/en/), designed to be
installed per-user, and invoked per-shell. `nvm` works on any POSIX-compliant shell (sh, dash, ksh, zsh, bash), in
particular on these platforms: unix, macOS, and [windows WSL](https://github.com/nvm-sh/nvm#important-notes).

[nvm](https://github.com/nvm-sh/nvm) allows you to quickly install and use different versions of node via the command
line.

Follow instructions on the [nvm](https://github.com/nvm-sh/nvm) page to install it and to see how to install the latest
or LTS release of Node.js

#### Using Homebrew

Please install [Homebrew](https://brew.sh/index) package manager for Mac.

Please make sure your installation is fully functional by running

```shell
brew doctor
```

If already installed, make sure to update it before use.

```shell
brew update && brew upgrade && brew cleanup
```

Install [node js](https://nodejs.org/)

```shell
brew install node
```
