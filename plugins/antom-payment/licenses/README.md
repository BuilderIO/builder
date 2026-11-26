# Supplemental dependency license

The npm archive for `is-in-browser@1.1.3` declares MIT but omits LICENSE.
`is-in-browser-1.1.3.LICENSE` is the unchanged upstream text from:

https://github.com/tuxsudo/is-in-browser/blob/56378377a3767c5822313a6aac846e9b10abb6ed/LICENSE

At that commit, package.json still identifies version 1.1.3. The `src/` tree
is unchanged from the npm release's gitHead
`653d0586c8d40db93262536ec60a4d2d50f3d78d`.
The build uses this supplement only for this exact package/version with MIT
metadata; other missing licenses fail the build. No network access is needed
to collect license texts at build time.
