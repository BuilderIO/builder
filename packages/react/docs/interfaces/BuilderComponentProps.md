[@builder.io/react](../README.md) / [Exports](../modules.md) / BuilderComponentProps

# Interface: BuilderComponentProps

## Table of contents

### Properties

- [apiKey](BuilderComponentProps.md#apikey)
- [builder](BuilderComponentProps.md#builder)
- [content](BuilderComponentProps.md#content)
- [context](BuilderComponentProps.md#context)
- [data](BuilderComponentProps.md#data)
- [entry](BuilderComponentProps.md#entry)
- [model](BuilderComponentProps.md#model)
- [options](BuilderComponentProps.md#options)
- [stopClickPropagationWhenEditing](BuilderComponentProps.md#stopclickpropagationwhenediting)

### Methods

- [contentError](BuilderComponentProps.md#contenterror)
- [contentLoaded](BuilderComponentProps.md#contentloaded)
- [onStateChange](BuilderComponentProps.md#onstatechange)
- [renderLink](BuilderComponentProps.md#renderlink)

## Properties

### apiKey

• `Optional` **apiKey**: `string`

**`package`**

Builder public API key.

**`see`** {@link builder.init()} for the preferred way of supplying your API key.

#### Defined in

[src/components/builder-component.component.tsx:176](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L176)

___

### builder

• `Optional` **builder**: `Builder`

Specific instance of Builder that should be used. You might use this for
server side rendering. It's generally not recommended except for very
advanced multi-tenant use cases.

#### Defined in

[src/components/builder-component.component.tsx:164](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L164)

___

### content

• `Optional` **content**: `BuilderContent`

Manually specify what Builder content JSON object to render. @see [https://github.com/BuilderIO/builder/tree/master/packages/react#passing-content-manually](https://github.com/BuilderIO/builder/tree/master/packages/react#passing-content-manually)

#### Defined in

[src/components/builder-component.component.tsx:212](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L212)

___

### context

• `Optional` **context**: `any`

Object that will be available in actions and bindings.

**`see`** [https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down](https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down)

#### Defined in

[src/components/builder-component.component.tsx:285](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L285)

___

### data

• `Optional` **data**: `any`

Data is passed along as `state.*` to the component.

**`see`** [https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down](https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down)

**`example`**
```
<BuilderComponent
 model="page"
 data={{
   products: productsList,
   myFunction: () => alert('Triggered!'),
   foo: 'bar'
 }} >
```

#### Defined in

[src/components/builder-component.component.tsx:158](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L158)

___

### entry

• `Optional` **entry**: `string`

Content entry ID for this component to fetch client side

#### Defined in

[src/components/builder-component.component.tsx:168](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L168)

___

### model

• `Optional` **model**: `string`

Name of the model this is rendering content for. Default is "page".

#### Defined in

[src/components/builder-component.component.tsx:136](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L136)

___

### options

• `Optional` **options**: `GetContentOptions`

#### Defined in

[src/components/builder-component.component.tsx:182](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L182)

___

### stopClickPropagationWhenEditing

• `Optional` **stopClickPropagationWhenEditing**: `boolean`

Set to true to not call `event.stopPropagation()` in the editor to avoid
issues with client site routing triggering when editing in Builder, causing
navigation to other pages unintended

#### Defined in

[src/components/builder-component.component.tsx:301](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L301)

## Methods

### contentError

▸ `Optional` **contentError**(`error`): `void`

Callback to run if an error occurred while fetching content.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `any` |

#### Returns

`void`

#### Defined in

[src/components/builder-component.component.tsx:207](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L207)

___

### contentLoaded

▸ `Optional` **contentLoaded**(`data`, `content`): `void`

Function callback invoked with `data` and your content when it becomes
available.

**`see`** [https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down](https://github.com/BuilderIO/builder/tree/master/packages/react#passing-data-and-functions-down)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `content` | `BuilderContent` |

#### Returns

`void`

#### Defined in

[src/components/builder-component.component.tsx:189](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L189)

___

### onStateChange

▸ `Optional` **onStateChange**(`newData`): `void`

Callback to run when Builder state changes (e.g. state.foo = 'bar' in an
action)

#### Parameters

| Name | Type |
| :------ | :------ |
| `newData` | `any` |

#### Returns

`void`

#### Defined in

[src/components/builder-component.component.tsx:225](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L225)

___

### renderLink

▸ `Optional` **renderLink**(`props`): `ReactNode`

Instead of having Builder render a link for you with plain anchor
elements, use your own function. Useful when using Next.js, Gatsby, or
other client side routers' custom `<Link>` components.

## Notes

This must be a function that returns JSX, not a component!

## Examples

**`see`** [https://github.com/BuilderIO/builder/blob/0f0bc1ca835335f99fc21efb20ff3c4836bc9f41/examples/next-js-builder-site/src/functions/render-link.tsx#L6](https://github.com/BuilderIO/builder/blob/0f0bc1ca835335f99fc21efb20ff3c4836bc9f41/examples/next-js-builder-site/src/functions/render-link.tsx#L6)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `AnchorHTMLAttributes`<`any`\> |

#### Returns

`ReactNode`

#### Defined in

[src/components/builder-component.component.tsx:203](https://github.com/builderio/builder/blob/8c1a05a9/packages/react/src/components/builder-component.component.tsx#L203)
