# Builder Content JSON schema

Use the schema at [dist/BuilderContent.json]() to test if builder content is
valid.

Usage will be tool specific but for VSCode and derivatives you can usually add
a `"$schema": "..."` entry to the root of the object for one time usage or
associate a filename with a specific schema

You should add something like the below example to have your editor use the
builder content schema:

```json
{
  "$schema": "https://raw.githubusercontent.com/BuilderIO/builder/main/packages/json-schema/dist/BuilderContent.json",
}
```

Specific editor integration instructions:
  - [VSCode](https://code.visualstudio.com/Docs/languages/json#_json-schemas-and-settings)
