import fs from "node:fs";
import path from "node:path";

import { CopyrightConfig, PackageJSON } from "./types.js";

export function getNameFromPackageJson(dir: string): string | undefined {
  const packagePath = path.join(dir, 'package.json');
  let name;

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    name = packageJson.name;
  }

  return name;
}

export function getVersionFromPackageJson(dir: string): string | undefined {
  const packagePath = path.join(dir, 'package.json');
  let version;

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    version = packageJson.version;
  }

  return version;
}

export function getCopyrightConfigFromPackageJson(dir: string): CopyrightConfig {
  const packagePath = path.join(dir, 'package.json');

  if (!fs.existsSync(packagePath)) {
    return {};
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as PackageJSON;

    if (packageJson.copyright) {
      return packageJson.copyright;
    }

    const config: CopyrightConfig = {};

    if (packageJson.author) {
      config.author = typeof packageJson.author === 'string'
        ? packageJson.author
        : packageJson.author.name;
    }

    if (packageJson.license) {
      config.license = packageJson.license;
    }

    return config;
  } catch (error) {
    console.error(`Failed to parse package.json for copyright config: ${error}`);
    return {};
  }
}
