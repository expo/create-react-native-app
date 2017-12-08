// based on jest official doc: https://facebook.github.io/jest/docs/en/manual-mocks.html
// __mocks__/fs.js
'use strict';

const path = require('path');

const fs = jest.genMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);
    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(directoryPath) {
  return mockFiles[directoryPath] || [];
}

function accessSync(directoryPath) {
  const dir = path.dirname(directoryPath);
  const children = mockFiles[dir];

  if (!children || children.indexOf(path.basename(directoryPath)) < 0) {
    throw new TypeError(`no such file/dir: ${directoryPath}`);
  }
}

fs.__setMockFiles = __setMockFiles;
fs.readdirSync = readdirSync;
fs.accessSync = accessSync;

module.exports = fs;