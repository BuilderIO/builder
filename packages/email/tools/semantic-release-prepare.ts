const path = require('path');
const { fork } = require('child_process');
const colors = require('colors');

const { readFileSync, writeFileSync } = require('fs');
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'package.json')));

pkg.scripts.prepush = 'npm run test:prod && npm run build';
pkg.scripts.commitmsg = 'validate-commit-msg';

writeFileSync(path.resolve(__dirname, '..', 'package.json'), JSON.stringify(pkg, null, 2));

// Call husky to set up the hooks
fork(path.resolve(__dirname, '..', 'node_modules', 'husky', 'bin', 'install'));

console.info();
console.info(colors.green('Done!!'));
console.info();

if (pkg.repository.url.trim()) {
  console.info(colors.cyan('Now run:'));
  console.info(colors.cyan('  npm install -g semantic-release-cli'));
  console.info(colors.cyan('  semantic-release-cli setup'));
  console.info();
  console.info(colors.cyan('Important! Answer NO to "Generate travis.yml" question'));
  console.info();
  console.info(
    colors.gray('Note: Make sure "repository.url" in your package.json is correct before')
  );
} else {
  console.info(colors.red('First you need to set the "repository.url" property in package.json'));
  console.info(colors.cyan('Then run:'));
  console.info(colors.cyan('  npm install -g semantic-release-cli'));
  console.info(colors.cyan('  semantic-release-cli setup'));
  console.info();
  console.info(colors.cyan('Important! Answer NO to "Generate travis.yml" question'));
}

console.info();
