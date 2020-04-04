# Builder.io JSX support (alpha)

A TypeScript custom transformer which enables you to use JSX with Builder.io

## Why

1. Write JSX code that can **compile and render to any language or framework** using [Builder.io's various SDKs](../packages) or custom targets
2. **Edit the JSX code visually** using Builder.io's editor and write code / use your own coding tools _side by side_

## Example

```tsx
export default state => {
  return (
    <div css={{ display: 'flex', flexDirection: 'column' }}>
      <h1>{state.title}</h1>
      <p>Hello there!</p>
    </div>
  );
};
```

Can be previewed and edited in the Builder.io visual editor, as well as run and render natively to any supported framework
