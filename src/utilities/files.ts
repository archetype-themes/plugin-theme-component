/* eslint-disable import/default */
import fs from 'fs-extra';
import path from 'node:path'

import logger from './logger.js'
import { sortObjectKeys } from './objects.js'

export function syncFiles(srcDir: string, destDir: string) {
  if (!fs.existsSync(srcDir)) {
    logger.error(`Source directory ${srcDir} does not exist`);
    return;
  }

  try {
    // eslint-disable-next-line import/no-named-as-default-member
    fs.ensureDirSync(destDir);

    // Get all files in both directories
    const srcFiles = fs.readdirSync(srcDir);
    const destFiles = fs.existsSync(destDir) ? fs.readdirSync(destDir) : [];

    // Remove files that don't exist in source
    for (const file of destFiles) {
      if (file.startsWith('.')) continue;
      if (!srcFiles.includes(file)) {
        const destPath = path.join(destDir, file);
        if (fs.statSync(destPath).isDirectory()) {
          fs.removeSync(destPath); // eslint-disable-line import/no-named-as-default-member
          logger.debug(`Removed directory: ${file}`);
        } else {
          fs.removeSync(destPath); // eslint-disable-line import/no-named-as-default-member
          logger.debug(`Removed file: ${file}`);
        }
      }
    }

    // Copy each file/directory from source
    for (const file of srcFiles) {
      if (file.startsWith('.')) continue;

      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        syncFiles(srcPath, destPath);
      } else {
        const srcContent = fs.readFileSync(srcPath, 'utf8');
        let needsCopy = true;

        if (fs.existsSync(destPath)) {
          const destContent = fs.readFileSync(destPath, 'utf8');
          needsCopy = srcContent !== destContent;
        }

        if (needsCopy) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  } catch (error) {
    logger.error(error as Error);
  }
}

export function copyFileIfChanged(src: string, dest: string) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(dest) || fs.readFileSync(src, 'utf8') !== fs.readFileSync(dest, 'utf8')) {
    fs.copyFileSync(src, dest);
  }
}

export function writeFileIfChanged(content: string, dest: string) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(dest) || content !== fs.readFileSync(dest, 'utf8')) {
    fs.writeFileSync(dest, content);
  }
}

export function writeJsonFile(
  filePath: string,
  content: Record<string, unknown>,
  options?: { format?: boolean }
): void {
  const formattedContent = options?.format ? sortObjectKeys(content) : content
  const dirPath = path.dirname(filePath)

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  fs.writeFileSync(filePath, JSON.stringify(formattedContent, null, 2) + '\n')
}

export function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true })
  }

  fs.mkdirSync(dir)
}
