import Minipass from 'minipass';
import * as path from 'path';
import { ReadEntry } from 'tar';

export function sanitizedName(name: string) {
  return name
    .replace(/[\W_]+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

class Transformer extends Minipass {
  data: string;

  constructor(private name: string) {
    super();
    this.data = '';
  }
  write(data: string) {
    this.data += data;
    return true;
  }
  end() {
    let replaced = this.data
      .replace(/Hello App Display Name/g, this.name)
      .replace(/HelloWorld/g, sanitizedName(this.name))
      .replace(/helloworld/g, sanitizedName(this.name.toLowerCase()));
    super.write(replaced);
    return super.end();
  }
}

// Files and directories that have `_` as their first character in React Native CLI templates
// These should be transformed to have `.` as the first character
const UNDERSCORED_DOTFILES = [
  'buckconfig',
  'eslintrc.js',
  'flowconfig',
  'gitattributes',
  'gitignore',
  'prettierrc.js',
  'watchmanconfig',
  'editorconfig',
  'bundle',
  'ruby-version',
  'node-version',
  'xcode.env',
];

export function createEntryResolver(name: string) {
  return (entry: ReadEntry) => {
    if (name) {
      // Rewrite paths for bare workflow
      entry.path = entry.path
        .replace(
          /HelloWorld/g,
          entry.path.includes('android') ? sanitizedName(name.toLowerCase()) : sanitizedName(name)
        )
        .replace(/helloworld/g, sanitizedName(name).toLowerCase());
    }
    if (entry.type && /^file$/i.test(entry.type) && path.basename(entry.path) === 'gitignore') {
      // Rename `gitignore` because npm ignores files named `.gitignore` when publishing.
      // See: https://github.com/npm/npm/issues/1862
      entry.path = entry.path.replace(/gitignore$/, '.gitignore');
    }
    for (const fileName of UNDERSCORED_DOTFILES) {
      entry.path = entry.path.replace(`_${fileName}`, `.${fileName}`);
    }
  };
}

export function createFileTransform(name: string) {
  return (entry: ReadEntry) => {
    // Binary files, don't process these (avoid decoding as utf8)
    if (
      ![
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.psd',
        '.tiff',
        '.svg',
        '.jar',
        '.keystore',

        // Font files
        '.otf',
        '.ttf',
      ].includes(path.extname(entry.path)) &&
      name
    ) {
      return new Transformer(name);
    }
    return undefined;
  };
}
