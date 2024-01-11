# Builder.io Next.js SDK Changelog (@builder.io/sdk-react-nextjs)

## 0.8.1

## 0.8.0

## 0.7.6

## 0.7.5

### Patch Changes

- ddb31e4: Fix: setting default input values
- ddb31e4: Fix: collection repetition bug for empty/undefined lists

## 0.7.4

### Patch Changes

- 5500600: Multiples fixes to SSR A/B testing logic
- d3c613d: Fix: Video block styles (aspect ratio, fitContent, etc.).
  Fix: Allow Video block to render children components.
- 5500600: Fix: Stringify inlined SSR A/B test scripts at build-time. Avoids mismatches caused by run-time stringification.

## 0.7.3

## 0.7.2

## 0.7.1

### Patch Changes

- f7e1a5e: Chore: added changesets workflow to automate changelogs and release process
- 89e5965: add `isolated-vm` package to sandbox VM code when running in Node environments
- 89e5965: - Add proper TypeScript types.
  - fix npm package configuration for ESM/CJS.

## 0.7.0

- Setting `noTraverse` option's default to `true` when fetching multiple content entries.

## 0.6.4

- No Change.

## 0.6.3

- Fix issue with block styles not updating when editing them.

## 0.6.2

- Fix: `next` peerDependency version range to go above canary version that includes `serverActions` fix.

## 0.6.1

- No Changes.

## 0.6.0

- Update build pipeline to generate 3 separate bundles for each environment: browser, node and edge runtimes.
- Use Vite to build SDK instead of `tsc`.

## 0.5.9

No Changes.

## 0.5.8

- Fix: properly serialize messages sent to visual editor.

## 0.5.7

- No Changes.

## 0.5.6

- No Changes.

## 0.5.5

- No changes.

## 0.5.4

- Fix build issues caused by extraneous `acorn` import.

## 0.5.2

- Fix: remove old `evaluate` logic that accidentally stayed in the bundle.

## 0.5.1

- Fix: make `RenderBlocks` properties `context` and `registeredComponents` optional for external use.

## 0.5.0

- Feature: Added support for rudimentary data-bindings in Non-Node.js (edge, serverless, etc.) server runtimes.

## 0.4.5

- Initial release
