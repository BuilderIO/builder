---
'@builder.io/sdk': patch
'@builder.io/sdk-angular': patch
'@builder.io/sdk-react-nextjs': patch
'@builder.io/sdk-qwik': patch
'@builder.io/sdk-react': patch
'@builder.io/sdk-react-native': patch
'@builder.io/sdk-solid': patch
'@builder.io/sdk-svelte': patch
'@builder.io/sdk-vue': patch
'@builder.io/react': patch
---

[Types]: adds a second argument to the `onChange` argument for custom component Inputs called `previousOptions`. It contains the `options` argument in its old state before the current `onChange` event was triggered.


Before:

```ts
onChange?: 
  | ((options: Map<string, any>) => void | Promise<void>) 
  | string;
```

After:

```ts
  onChange?:
    | ((options: Map<string, any>, previousOptions?: Map<string, any>) => void | Promise<void>)
    | string;
```

