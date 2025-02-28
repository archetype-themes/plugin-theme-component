import path from 'node:path'

import { CopyrightOptions } from './types.js'

export const COPYRIGHT_TEMPLATES: Record<string, (message: string) => string> = {
  css: (message: string) => `/* ${message} */\n\n`,
  js: (message: string) => `// ${message}\n\n`,
  liquid: (message: string) => `{% # ${message} %}\n\n`,
  svg: (message: string) => `<!-- ${message} -->\n\n`
}

export function generateCopyrightMessage(
  collectionName: string,
  collectionVersion: string,
  copyright?: CopyrightOptions['copyright']
): string {
  const year = new Date().getFullYear();
  const author = copyright?.author || '';
  const license = copyright?.license || '';

  return `${collectionName} v${collectionVersion} | Copyright © ${year}` +
    (author && ` ${author}`) +
    (license && ` | ${license}`);
}

export function shouldAddCopyright(filePath: string): boolean {
  // Skip vendor files
  if (path.basename(filePath).startsWith('vendor.')) {
    return false;
  }

  const fileExtension = path.extname(filePath).toLowerCase().slice(1);

  // Only add copyright to supported file types
  return Object.keys(COPYRIGHT_TEMPLATES).includes(fileExtension);
}

export function addCopyrightComment(
  content: string,
  filePath: string,
  options: {
    collectionName: string;
    collectionVersion: string;
  } & Partial<CopyrightOptions>
): string {
  if (!shouldAddCopyright(filePath)) {
    return content;
  }

  const { collectionName, collectionVersion, copyright } = options;
  const fileExtension = path.extname(filePath).toLowerCase().slice(1);

  // Check if the copyright comment is already present
  if (content.includes(`${collectionName} v${collectionVersion}`)) {
    return content;
  }

  const copyrightMessage = generateCopyrightMessage(
    collectionName,
    collectionVersion,
    copyright
  );

  const commentWrapper = COPYRIGHT_TEMPLATES[fileExtension];
  const copyrightComment = commentWrapper(copyrightMessage);

  // For SVG files, we need to insert the comment after the XML declaration if present
  if (fileExtension === 'svg' && content.startsWith('<?xml')) {
    const xmlEndIndex = content.indexOf('?>') + 2;
    return content.slice(0, xmlEndIndex) + '\n' + copyrightComment + content.slice(xmlEndIndex);
  }

  return copyrightComment + content;
}
