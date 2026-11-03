const fs = require('node:fs');
const path = require('node:path');

// Collect only modules reachable from emitted chunks, including concatenated modules.
function bundledPackageRoots(compilation) {
  const roots = new Set();
  const visited = new Set();
  function visit(module) {
    if (visited.has(module)) return;
    visited.add(module);
    if (module.resource && module.resource.split(/[\\/]/).includes('node_modules')) {
      let directory = path.dirname(module.resource.split('?')[0]);
      let found = false;
      while (path.dirname(directory) !== directory) {
        const manifest = path.join(directory, 'package.json');
        if (fs.existsSync(manifest)) {
          const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
          if (pkg.name && pkg.version) {
            roots.add(directory);
            found = true;
            break;
          }
        }
        directory = path.dirname(directory);
      }
      if (!found) throw new Error('Cannot identify a bundled third-party package.');
    }
    if (module.modules) for (const child of module.modules) visit(child);
  }
  for (const chunk of compilation.chunks) {
    for (const module of compilation.chunkGraph.getChunkModulesIterable(chunk)) visit(module);
  }
  return [...roots];
}

function renderNotices(roots) {
  const records = roots.map(directory => {
    const pkg = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    const names = fs.readdirSync(directory).filter(name =>
      /^(licen[sc]e|copying|notice)([._-].*)?$/i.test(name) &&
      fs.statSync(path.join(directory, name)).isFile()).sort();
    const supplement = pkg.name === 'is-in-browser' && pkg.version === '1.1.3' && pkg.license === 'MIT';
    const hasLicense = names.some(name => /^(licen[sc]e|copying)([._-].*)?$/i.test(name));
    if (!hasLicense && !supplement) {
      throw new Error(`Missing license text for bundled package ${pkg.name}@${pkg.version}`);
    }
    const texts = names.map(name => {
      const content = fs.readFileSync(path.join(directory, name), 'utf8');
      if (!content.trim()) throw new Error(`Empty notice for ${pkg.name}@${pkg.version}: ${name}`);
      return `--- ${name} ---\n${content}`;
    });
    if (!hasLicense && supplement) {
      const content = fs.readFileSync(path.join(__dirname, '../licenses/is-in-browser-1.1.3.LICENSE'), 'utf8');
      if (!content.trim()) throw new Error('Empty supplemental license for is-in-browser@1.1.3');
      texts.push('--- Upstream LICENSE (56378377a3767c5822313a6aac846e9b10abb6ed) ---\n' + content);
    }
    return `=== ${pkg.name}@${pkg.version} ===\nLicense: ${pkg.license || 'See license text below'}\n\n${texts.join('\n\n')}\n`;
  });
  // No machine paths or build dates: identical dependencies produce identical notices.
  return 'Third-party licenses for code bundled in plugin.system.js\n\n' +
    [...new Set(records)].sort().join('\n');
}

class ThirdPartyNoticesPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('ThirdPartyNoticesPlugin', compilation => {
      compilation.hooks.processAssets.tap({
        name: 'ThirdPartyNoticesPlugin',
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      }, () => {
        const full = renderNotices(bundledPackageRoots(compilation));
        const name = 'plugin.system.js.LICENSE.txt';
        const existing = compilation.getAsset(name);
        const source = new compiler.webpack.sources.RawSource(
          (existing ? existing.source.source().toString() + '\n\n' : '') + full);
        if (existing) compilation.updateAsset(name, source);
        else compilation.emitAsset(name, source);
      });
    });
  }
}

module.exports = { ThirdPartyNoticesPlugin, bundledPackageRoots, renderNotices };
