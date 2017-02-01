## Console Colors

The convention for using chalk in console output:

* blue -> in progress
* green -> success
* yellow -> warn
* red -> error
* cyan -> something the user inputs
* underline -> URL

Developing

Linking xdl

set these up, then make sure to node_modules/react-native/packager/packager.sh --reset-cache

app.json:

```
{
  "exponent": {
    "sdkVersion": "12.0.0",
    "packagerOpts": {
      "config": "rn-cli.config.js"
    }
  }
}
```

rn-cli.config.js:

```
'use strict';

var blacklist = require('react-native/packager/blacklist');

var toExport = {
  getBlacklistRE() {
    var subList = [
      /xdl\/src\/.*/
    ];

    console.log('RN-CLI.CONFIG.JS: lol this is definitely getting loaded now');

    var list = blacklist(subList);

    console.log(`RN-CLI.CONFIG.JS: passing ${list} to RN packager as blacklist`);

    console.log(`${'/Users/adam/universe/dev/xdl/src/xdl.js'.match(list)}`);

    return list;
  },
};

module.exports = toExport;
```
