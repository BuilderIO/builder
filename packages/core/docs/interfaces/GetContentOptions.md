# Interface: GetContentOptions

## Table of contents

### Properties

- [cache](GetContentOptions.md#cache)
- [cacheSeconds](GetContentOptions.md#cacheseconds)
- [cachebust](GetContentOptions.md#cachebust)
- [entry](GetContentOptions.md#entry)
- [extractCss](GetContentOptions.md#extractcss)
- [fields](GetContentOptions.md#fields)
- [format](GetContentOptions.md#format)
- [includeRefs](GetContentOptions.md#includerefs)
- [includeUrl](GetContentOptions.md#includeurl)
- [initialContent](GetContentOptions.md#initialcontent)
- [key](GetContentOptions.md#key)
- [limit](GetContentOptions.md#limit)
- [model](GetContentOptions.md#model)
- [noEditorUpdates](GetContentOptions.md#noeditorupdates)
- [offset](GetContentOptions.md#offset)
- [omit](GetContentOptions.md#omit)
- [options](GetContentOptions.md#options)
- [prerender](GetContentOptions.md#prerender)
- [preview](GetContentOptions.md#preview)
- [query](GetContentOptions.md#query)
- [rev](GetContentOptions.md#rev)
- [staleCacheSeconds](GetContentOptions.md#stalecacheseconds)
- [static](GetContentOptions.md#static)
- [url](GetContentOptions.md#url)
- [userAttributes](GetContentOptions.md#userattributes)

## Properties

### cache

• `Optional` **cache**: `boolean`

Set to `false` to not cache responses when running on the client.

#### Defined in

[builder.class.ts:362](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L362)

___

### cacheSeconds

• `Optional` **cacheSeconds**: `number`

How long in seconds content should be cached for. Sets the max-age of the cache-control header
response header.

Use a higher value for better performance, lower for content that will change more frequently

**`see`** [https://www.builder.io/c/docs/query-api#__next:~:text=%26includeRefs%3Dtrue-,cacheSeconds,-No](https://www.builder.io/c/docs/query-api#__next:~:text=%26includeRefs%3Dtrue-,cacheSeconds,-No)

#### Defined in

[builder.class.ts:296](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L296)

___

### cachebust

• `Optional` **cachebust**: `boolean`

Bust through all caches. Not recommended for production (for performance),
but can be useful for development and static builds (so the static site has
fully fresh / up to date content)

#### Defined in

[builder.class.ts:334](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L334)

___

### entry

• `Optional` **entry**: `string`

Specific content entry ID to fetch.

#### Defined in

[builder.class.ts:372](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L372)

___

### extractCss

• `Optional` **extractCss**: `boolean`

Extract any styles to a separate css property when generating HTML.

#### Defined in

[builder.class.ts:344](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L344)

___

### fields

• `Optional` **fields**: `string`

#### Defined in

[builder.class.ts:379](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L379)

___

### format

• `Optional` **format**: ``"amp"`` \| ``"email"`` \| ``"html"`` \| ``"react"`` \| ``"solid"``

**`package`**

Affects HTML generation for specific targets.

#### Defined in

[builder.class.ts:395](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L395)

___

### includeRefs

• `Optional` **includeRefs**: `boolean`

Follow references. If you use the `reference` field to pull in other content without this
enabled we will not fetch that content for the final response.

#### Defined in

[builder.class.ts:287](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L287)

___

### includeUrl

• `Optional` **includeUrl**: `boolean`

**`package`**

#### Defined in

[builder.class.ts:282](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L282)

___

### initialContent

• `Optional` **initialContent**: `any`

**`package`**

`BuilderContent` to render instead of fetching.

#### Defined in

[builder.class.ts:354](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L354)

___

### key

• `Optional` **key**: `string`

#### Defined in

[builder.class.ts:389](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L389)

___

### limit

• `Optional` **limit**: `number`

Maximum number of results to return. Defaults to `1`.

#### Defined in

[builder.class.ts:311](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L311)

___

### model

• `Optional` **model**: `string`

The name of the model to fetch content for.

#### Defined in

[builder.class.ts:358](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L358)

___

### noEditorUpdates

• `Optional` **noEditorUpdates**: `boolean`

**`package`**

Don't listen to updates in the editor - this is useful for embedded
symbols so they don't accidentally listen to messages as you are editing
content thinking they should updates when they actually shouldn't.

#### Defined in

[builder.class.ts:430](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L430)

___

### offset

• `Optional` **offset**: `number`

Pagination results offset. Defaults to zero.

#### Defined in

[builder.class.ts:348](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L348)

___

### omit

• `Optional` **omit**: `string`

Omit only these fields.

**`example`**
```
&omit=data.bigField,data.blocks
```

#### Defined in

[builder.class.ts:388](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L388)

___

### options

• `Optional` **options**: `Object`

Additional query params of the Content API to send.

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[builder.class.ts:422](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L422)

___

### prerender

• `Optional` **prerender**: `boolean`

Convert any visual builder content to HTML.

This will be on data.html of the response's content entry object json.

#### Defined in

[builder.class.ts:340](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L340)

___

### preview

• `Optional` **preview**: `boolean`

**`package`**

Indicate that the fetch request is for preview purposes.

#### Defined in

[builder.class.ts:368](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L368)

___

### query

• `Optional` **query**: `any`

Mongodb style query of your data. E.g.:

```js
query: {
 id: 'abc123',
 data: {
   myCustomField: { $gt: 20 },
 }
}
```

See more info on MongoDB's query operators and format.

**`see`** [https://docs.mongodb.com/manual/reference/operator/query/](https://docs.mongodb.com/manual/reference/operator/query/)

#### Defined in

[builder.class.ts:328](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L328)

___

### rev

• `Optional` **rev**: `string`

**`package`**

Specific string to use for cache busting. e.g. every time we generate
HTML we generate a rev (a revision ID) and we send that with each request
on the client, such that if we generate new server HTML we get a new rev
and we use that to bust the cache because even though the content ID may
be the same, it could be an updated version of this content that needs to
be fresh.

#### Defined in

[builder.class.ts:411](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L411)

___

### staleCacheSeconds

• `Optional` **staleCacheSeconds**: `number`

Builder.io uses stale-while-revalidate caching at the CDN level. This means we always serve
from edge cache and update caches in the background for maximum possible performance. This also
means that the more frequently content is requested, the more fresh it will be. The longest we
will ever hold something in stale cache is 1 day by default, and you can set this to be shorter
yourself as well. We suggest keeping this high unless you have content that must change rapidly
and gets very little traffic.

**`see`** [https://www.fastly.com/blog/prevent-application-network-instability-serve-stale-content](https://www.fastly.com/blog/prevent-application-network-instability-serve-stale-content)

#### Defined in

[builder.class.ts:307](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L307)

___

### static

• `Optional` **static**: `boolean`

**`package`**

Tell the API that when generating HTML to generate it in static mode for
a/b tests instead of the older way we did this

#### Defined in

[builder.class.ts:418](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L418)

___

### url

• `Optional` **url**: `string`

Alias for userAttributes.urlPath except it can handle a full URL (optionally with host,
protocol, query, etc) and we will parse out the path.

#### Defined in

[builder.class.ts:278](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L278)

___

### userAttributes

• `Optional` **userAttributes**: [`UserAttributes`](UserAttributes.md)

User attribute key value pairs to be used for targeting
https://www.builder.io/c/docs/custom-targeting-attributes

e.g.
```js
userAttributes: {
  urlPath: '/',
  returnVisitor: true,
}
```

#### Defined in

[builder.class.ts:273](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L273)
