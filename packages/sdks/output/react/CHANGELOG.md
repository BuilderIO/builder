### 0.2.0

- Sets the default `apiVersion` to `v3`.

In case you feel the need to use our older API Version `v2`, reach out to us at support@builder.io first. But you can override the default by setting `apiVersion` explicitly to `v2` as follows:

```jsx
<RenderContent apiVersion="v2" />
```

```js
getContent({ apiVersion: 'v2' });
```

More details on the Builder API Versions visit [this link](https://www.builder.io/c/docs/content-api-versions).
