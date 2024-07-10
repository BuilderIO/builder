---
'@builder.io/sdk-react-nextjs': patch
---

Feature: add `@builder.io/sdk-react-nextjs/node/init` entry point with `initializeNodeRuntime` export that sets the IVM instance.

This import should be called in a server-only location, such as _inside_ of a Next.js async `Page` component.

```tsx
export default async function Page(props: MyPageProps) {
  // NOTE: the import must be inside the Page component itself.
  const { initializeNodeRuntime } = await import('@builder.io/sdk-react-nextjs/node/init');
  initializeNodeRuntime();

  // rest of your logic...
}
```
