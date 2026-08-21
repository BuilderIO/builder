const { execFileSync } = require('child_process');
const path = require('path');

const packageDirectory = path.resolve(__dirname, '..');
const requiredFiles = [
  'dist/system/builder-webcomponents-async.js',
  'sri-manifest.json',
];

const packedPackages = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: packageDirectory,
    encoding: 'utf8',
  })
);
const packageFiles = new Set(packedPackages[0].files.map(({ path: filePath }) => filePath));
const missingFiles = requiredFiles.filter((filePath) => !packageFiles.has(filePath));

if (missingFiles.length > 0) {
  throw new Error(`Required files missing from npm package: ${missingFiles.join(', ')}`);
}
