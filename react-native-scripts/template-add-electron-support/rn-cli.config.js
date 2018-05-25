var blacklist = require('metro/src/blacklist');

const config = {
  getBlacklistRE() {
    return blacklist([
      /desktop_dist\/(.*)/,
      /node_modules\/electron.*?\/(.*)/
    ]);
  },
};

module.exports = config;