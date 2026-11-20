const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

const version = manifest.version.split('.').map(v => parseInt(v, 10));
version[2] += 1;

manifest.version = version.join('.');

fs.writeFileSync('./manifest.json', JSON.stringify(manifest, null, 2) + '\n');
