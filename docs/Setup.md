# Set up your workstation

## MacOS with Homebrew

### Homebrew

Please install [Homebrew](https://brew.sh/index) package manager for Mac.

Please make sure your installation is fully functional by running

```shell
brew doctor
```

If already installed, make sure to update it before use.

```shell
brew update && brew upgrade && brew cleanup
```

Install [node js](https://nodejs.org/) and [Corepack](https://nodejs.org/api/corepack.html) which includes a version of
yarn.

```shell
brew install node corepack
```

Make sure [Corepack](https://nodejs.org/api/corepack.html) is enabled.

```shell
corepack enable
```

At the moment, Corepack defaults to an old 1.x release of yarn. It is recommended to change that for the latest version.
To enable that, first find the latest version of yarn by using
their [releases](https://github.com/yarnpkg/berry/releases) page, then run the following command after replacing
**3.2.4** with the latest release.

```shell
corepack prepare yarn@3.2.4 --activate
```
