const glob = require('glob-promise');
const { readFile, writeFile } = require('fs').promises;

/**
 * Typedoc generates markdown files with links to docs that we gitignore,
 * so let's clean out the dead links that display as breadcrumbs at the top
 */
async function main() {
  const files = await glob('docs/**/*.md');
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    // Detect the initial breadcrumb pattern and remove it
    const newContent = content.replace(/^\[@builder.io\/sdk\].*\n+/g, '');
    await writeFile(file, newContent);
  }
}

main();
