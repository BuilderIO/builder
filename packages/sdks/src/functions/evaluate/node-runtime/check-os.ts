import fs from 'fs';
import os from 'os';

let cachedOS: string | null = null;

const whichOS = (): string => {
  if (cachedOS) return cachedOS;

  const platform = os.platform();
  switch (platform) {
    case 'linux':
      try {
        const data = fs.readFileSync('/etc/os-release', 'utf8');
        const nameMatch = data.match(/^NAME="(.+)"$/m);
        const versionMatch = data.match(/^VERSION_ID="(.+)"$/m);
        const osName = nameMatch?.[1] ?? 'Linux (unknown distribution)';
        const osVersion = versionMatch?.[1] ?? 'unknown version';
        cachedOS = `${osName} ${osVersion}`;
      } catch (err) {
        console.warn(
          `Error reading Linux OS information from /etc/os-release:`,
          err
        );
        cachedOS = 'Linux';
      }
      break;
    case 'darwin':
      cachedOS = 'macOS';
      break;
    case 'win32':
      cachedOS = 'Windows';
      break;
    default:
      cachedOS = platform;
  }

  return cachedOS;
};

const osName = whichOS();
console.log('[Builder.io] running on OS:', osName);

const ubuntuVersionMatch = osName.match(/Ubuntu (\d+)/);
if (ubuntuVersionMatch) {
  const ubuntuVersion = parseInt(ubuntuVersionMatch[1]);
  if (ubuntuVersion >= 22) {
    console.warn(
      `WARNING: You are running Builder SDK on ${osName}. This is known to cause crashes with \`isolated-vm\`. See https://github.com/BuilderIO/builder/issues/3605 for more information.`
    );
  }
}
