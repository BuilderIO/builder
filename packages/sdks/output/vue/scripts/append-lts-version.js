// read the version from the package.json file
import fs from 'fs';
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
let version = packageJson.version;

console.log(`Current version: ${version}`);

if (!version.includes('-vue2-lts-')) {
  version = `${version}-vue2-lts-0`;
} else {
  // bump the version by appending the number after vue2-lts
  const [originVersion, ltsVersion] = version.split('-vue2-lts-');
  version = `${originVersion}-vue2-lts-${Number(ltsVersion) + 1}`;
}

console.log(`New version: ${version}`);

// write the new version to the package.json file
packageJson.version = version;
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
