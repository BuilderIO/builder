---
"@builder.io/sdk": minor
---

Added an opt-in `Builder.logLevel` setting (defaulting from the `BUILDER_SDK_LOG_LEVEL` environment variable under Node.js) that logs the request URL, response status, and `x-request-id` response header for every content fetch via `console.debug`. This makes it possible to correlate a specific SDK call with a Builder-side request when reporting intermittent API issues, without changing any existing response shape or default behavior.
