const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { generateSriManifest } = require('./generate-sri-manifest');

describe('generateSriManifest', () => {
  let temporaryDirectory;

  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'builder-webcomponents-sri-'));
  });

  afterEach(() => {
    fs.rmdirSync(temporaryDirectory, { recursive: true });
  });

  it('writes the package version and SHA-384 hash for the entry artifact', () => {
    const packageJsonPath = path.join(temporaryDirectory, 'package.json');
    const entryArtifactPath = path.join(temporaryDirectory, 'entry.js');
    const manifestPath = path.join(temporaryDirectory, 'sri-manifest.json');
    const artifact = Buffer.from('published webcomponents entry');

    fs.writeFileSync(packageJsonPath, JSON.stringify({ version: '2.0.2' }));
    fs.writeFileSync(entryArtifactPath, artifact);

    const manifest = generateSriManifest({
      packageJsonPath,
      entryArtifactPath,
      manifestPath,
    });

    const expectedIntegrity = `sha384-${crypto
      .createHash('sha384')
      .update(artifact)
      .digest('base64')}`;

    expect(manifest).toEqual({ version: '2.0.2', integrity: expectedIntegrity });
    expect(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))).toEqual(manifest);
  });

  it('fails when the published entry artifact is missing', () => {
    const packageJsonPath = path.join(temporaryDirectory, 'package.json');
    const entryArtifactPath = path.join(temporaryDirectory, 'missing.js');
    const manifestPath = path.join(temporaryDirectory, 'sri-manifest.json');

    fs.writeFileSync(packageJsonPath, JSON.stringify({ version: '2.0.2' }));

    expect(() =>
      generateSriManifest({
        packageJsonPath,
        entryArtifactPath,
        manifestPath,
      })
    ).toThrow();
  });
});
