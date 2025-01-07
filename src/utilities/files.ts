// @ts-ignore
import fse from 'fs-extra';
import fs from 'node:fs'
import path from 'node:path'

import logger from './logger.js'

/**
 * Synchronizes files from a source directory to a destination directory.
 * Removes files in destination that don't exist in source and copies new/changed files.
 * Ensures minimal file operations to avoid unnecessary watcher events.
 */
export function syncFiles(srcDir: string, destDir: string) {
  if (!fse.existsSync(srcDir)) {
    logger.error(`Source directory ${srcDir} does not exist`);
    return;
  }

  try {
    // Ensure destination exists
    fse.ensureDirSync(destDir);

    // Get all files in both directories
    const srcFiles = fse.readdirSync(srcDir);
    const destFiles = fse.existsSync(destDir) ? fse.readdirSync(destDir) : [];

    // Remove files that don't exist in source
    destFiles.forEach((file: string) => {
      if (file.startsWith('.')) return;
      if (!srcFiles.includes(file)) {
        const destPath = path.join(destDir, file);
        if (fse.statSync(destPath).isDirectory()) {
          fse.removeSync(destPath);
          logger.debug(`Removed directory: ${file}`);
        } else {
          fse.removeSync(destPath);
          logger.debug(`Removed file: ${file}`);
        }
      }
    });
    
    // Copy each file/directory from source
    srcFiles.forEach((file: string) => {
      if (file.startsWith('.')) return;

      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      const stat = fse.statSync(srcPath);

      if (stat.isDirectory()) {
        syncFiles(srcPath, destPath);
      } else {
        const srcContent = fse.readFileSync(srcPath, 'utf8');
        let needsCopy = true;

        if (fse.existsSync(destPath)) {
          const destContent = fse.readFileSync(destPath, 'utf8');
          needsCopy = srcContent !== destContent;
        }

        if (needsCopy) {
          fse.copyFileSync(srcPath, destPath);
        }
      }
    });
  } catch (error) {
    logger.error(error as Error);
  }
}

/**
 * Copies a file only if the destination doesn't exist or if the content has changed.
 */
export function copyFileIfChanged(src: string, dest: string) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(dest) || fs.readFileSync(src, 'utf8') !== fs.readFileSync(dest, 'utf8')) {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Cleans (removes and recreates) a directory.
 */
export function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, {recursive: true})
  }

  fs.mkdirSync(dir)
}
