#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

const packageJson = require('../package.json');
delete packageJson.resolutions['@builder.io/mitosis-cli'];
fs.writeFileSync(
  path.join(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2)
);
