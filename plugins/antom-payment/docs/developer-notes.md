# Maintainer notes

The supported customer flow is in the [README](../README.md). The browser plugin
only copies a fixed-source installation request and a usage example. It does not
download files, run an installer, persist settings, read credentials or call
payment APIs. File checks in the prompt are requests to Builder Agent, not
plugin-enforced filesystem controls.

## Verification

- From `plugins/antom-payment`, run `npm ci`, then `npm test` to build and test
  the prompt, clipboard, UI, package metadata and dependency notices.
- `npm run test:package`: pack into a temporary directory and enforce the exact
  browser-only package allowlist; no registry publication or CLI installation.
- `npm run check:antom-skill-drift`: compare the actual pinned upstream entry
  with upstream main; never update the pin automatically.

The old CLI, configuration editors, mirrored Skills and ZIP distribution are
removed. Existing Skills and saved settings in user projects remain untouched.
Local tests are not evidence of Builder source retrieval, installation or Skill
discovery; verify those separately in a real Builder project.

## Publication boundaries

Webpack collects the package license and NOTICE files for third-party modules in
emitted chunks (including concatenated modules). Full texts are appended to
`dist/plugin.system.js.LICENSE.txt`, alongside the minifier's extracted notices.
Missing or empty license texts fail the build. This file ships with the npm
package. Externally supplied Builder
and React modules are not bundled. The root MIT license remains unchanged.

Public source hosting or npm publication does not imply Builder public approval.
The README is the intended post-approval user guide; confirm the final package
identity and Builder Code/Agent support with Builder during review. The installation
image is an edited illustration of the proposed package name, not evidence of
registry availability or approval.

The package is independent of the repository's SDK workspaces. The scoped
`antom-payment-plugin.yml` workflow runs its own npm lockfile on Linux and Windows;
it does not publish, use registry credentials or deploy GitHub Pages. Source-drift
checking remains a manual command, not a scheduled job in this repository.

The proposed `@builder.io/plugin-antom-payment` identity requires approval and npm
scope access from Builder maintainers. This contribution does not configure
automatic publication. Agree the initial version and release owner during review.

Company approval for public source, license, brand, recording assets, publishing
account and maintenance ownership is separate from technical verification.
