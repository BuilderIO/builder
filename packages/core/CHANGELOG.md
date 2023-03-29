### 1.1.35
- Add new `apiVersion` property to toggle between Builder API versions. Defaults to `v1`. Possible values: `v1` and `v3`.

### 1.1.34
- Use correct types for enum, fixes remix type checks.
- Use fetch fallback safely, fixes issues on Salesforce managed runtime.

### 1.1.33
- Use correct types for `responsiveStyles`, fixes remix type checks.

### 1.1.30
- Add support for threhold and repeat inputs on `ScrollInvView` animations.

### 1.1.29

- added types for `override` option

### 1.1.27

- improved logging during JSON.parse errors
- deprecation notice on `Builder.VERSION`
- stop tracking impressions for content with no id

### 1.1.26

- fix: respect `builder.canTrack` for not setting the session cookie https://github.com/BuilderIO/builder/pull/900
