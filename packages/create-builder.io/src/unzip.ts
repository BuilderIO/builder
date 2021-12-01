import fs from 'fs';
import path from 'path';
import { fromBuffer } from 'yauzl';

export function unZipBuffer(buffer: Buffer, projectName: string, prefixStr: string | undefined) {
  const prefix = prefixStr ? prefixStr.split('/') : [];
  return new Promise((resolve, reject) => {
    fromBuffer(buffer, { lazyEntries: true }, handleZipFile(projectName, prefix, resolve, reject));
  });
}

function handleZipFile(projectName: string, prefix: string[], resolve: any, reject: any) {
  return (err: any, zipfile: any) => {
    if (err) {
      throw err;
    }

    // track when we've closed all our file handles
    zipfile.readEntry();
    zipfile.on('entry', (entry: any) => {
      const segments = entry.fileName.split('/');
      let size = Math.min(prefix.length, segments.length - 1);
      for (let i = 0; i < size; i++) {
        if (segments[i + 1] !== prefix[i]) {
          zipfile.readEntry();
          return;
        }
      }

      if (entry.fileName[entry.fileName.length - 1] === path.sep) {
        // Directory file names end with '/'.
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        zipfile.readEntry();
      } else if (segments.length > prefix.length + 1) {
        segments[0] = projectName;
        segments.splice(1, prefix.length);
        const fileName = segments.join(path.sep);
        // ensure parent directory exists
        mkdirp(path.dirname(fileName), () => {
          zipfile.openReadStream(entry, (errL: any, readStream: any) => {
            if (errL) {
              throw errL;
            }
            readStream.on('end', () => {
              zipfile.readEntry();
            });
            // pump file contents
            readStream.pipe(fs.createWriteStream(fileName));
          });
        });
      } else {
        zipfile.readEntry();
      }
    });
    zipfile.once('error', reject);
    zipfile.once('end', () => {
      resolve();
    });
  };
}

function mkdirp(dir: string, cb: any) {
  if (dir === '.') return cb();
  fs.stat(dir, err => {
    if (err == null) return cb(); // already exists

    const parent = path.dirname(dir);
    mkdirp(parent, () => {
      fs.mkdir(dir, cb);
    });
  });
}
