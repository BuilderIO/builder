const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const packageDirectory = path.resolve(__dirname, '..');
const packageJsonPath = path.join(packageDirectory, 'package.json');
const entryArtifactPath = path.join(
  packageDirectory,
  'dist/system/builder-webcomponents-async.js'
);
const manifestPath = path.join(packageDirectory, 'sri-manifest.json');

function generateSriManifest({
  packageJsonPath: packageJsonFile = packageJsonPath,
  entryArtifactPath: entryArtifact = entryArtifactPath,
  manifestPath: manifestFile = manifestPath,
} = {}) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
  const artifact = fs.readFileSync(entryArtifact);
  const integrity = `sha384-${crypto.createHash('sha384').update(artifact).digest('base64')}`;

  const manifest = {
    version: packageJson.version,
    integrity,
  };

  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (require.main === module) {
  generateSriManifest();
}

module.exports = { generateSriManifest };
