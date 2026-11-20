---
"@builder.io/sdk": minor
---

Added an opt-in `Builder.logLevel` setting (`'silent' | 'error' | 'warn' | 'info' | 'debug'`, defaulting from the `BUILDER_SDK_LOG_LEVEL` environment variable under Node.js or `'silent'` otherwise) that emits graduated HTTP request/response diagnostics using the corresponding standard `console` methods (`console.error`, `console.warn`, `console.info`, `console.debug`), including request duration, response headers (with sensitive headers redacted), and the `x-request-id` response header. This makes it possible to inspect SDK HTTP traffic and correlate SDK calls with Builder-side requests without changing any existing response shape or default behavior.
