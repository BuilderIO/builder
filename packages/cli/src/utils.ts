import fse from 'fs-extra';
import traverse from 'traverse';

export const readAsJson = (path: string) => {
  const content = fse.readFileSync(path);
  return JSON.parse(content.toString())
}

export const getDirectories = (source: string) =>
  fse.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())

export const getFiles = (source: string) =>
    fse.readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isFile())

export const replaceField = (json: any, newValue: string, oldValue: string)  => {
  return traverse(json).map(function(field) {
    if (this.key?.includes('@')) {
      // exclude meta keys from updates
      return;
    }
    if (field === oldValue) {
      this.update(newValue)
    }
  })
}