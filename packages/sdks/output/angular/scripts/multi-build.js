const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const sdkEnv = process.env.SDK_ENV;

if (!sdkEnv) {
  throw new Error('SDK_ENV is required to build the SDK.');
}

const workingDir = path.resolve(__dirname, '../');
const ngPackageJsonPath = path.resolve(workingDir, 'ng-package.json');
const ngPackageJson = require(ngPackageJsonPath);

const outputPath = {
  node: './lib/node',
  browser: './lib/browser',
}[sdkEnv];

if (!outputPath) {
  throw new Error(
    `Unknown SDK_ENV: ${sdkEnv}. Expected one of 'node', 'browser'.`
  );
}

// set the destination path to the correct output path for specific SDK_ENV
ngPackageJson.dest = outputPath;

// Write the modified ng-package.json back
fs.writeFileSync(
  ngPackageJsonPath,
  JSON.stringify(ngPackageJson, null, 2),
  'utf-8'
);

// pre build - update placeholder-runtime to use actual runtimes
const chooseEvalFile = path.resolve(
  workingDir,
  'src/functions/evaluate/choose-eval.ts'
);

// read the file, check for "placeholder-runtime" and replace with actual runtime
let content = fs.readFileSync(chooseEvalFile, 'utf-8');

const getFolderName = () => {
  switch (sdkEnv) {
    case 'node':
      return 'node-runtime';
    case 'browser':
      return 'browser-runtime';
    default:
      throw new Error(
        `Unknown SDK_ENV: ${sdkEnv}. Expected one of 'node' or 'browser'.`
      );
  }
};

content = content.replace(/placeholder-runtime/g, `./${getFolderName()}/index`);

fs.writeFileSync(chooseEvalFile, content, 'utf-8');

// Run the Angular build command
execSync(`ng build --project sdk-angular`, { stdio: 'inherit' });

// remove `package.json` generated inside the `lib/*` folder
const packageJsonPath = path.resolve(workingDir, outputPath, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  fs.unlinkSync(packageJsonPath);
}

// revert back the choose-eval.ts file
content = content.replace(`./${getFolderName()}/index`, "placeholder-runtime");

fs.writeFileSync(chooseEvalFile, content, 'utf-8');
