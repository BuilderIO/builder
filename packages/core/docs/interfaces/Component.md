# Interface: Component

This is the interface for the options for `Builder.registerComponent`

```js
Builder.registerComponent(YourComponent, {
 // <- Component options
})
```

Learn more about registering custom components [here](https://www.builder.io/c/docs/custom-react-components)

## Table of contents

### Properties

- [canHaveChildren](Component.md#canhavechildren)
- [childRequirements](Component.md#childrequirements)
- [defaultChildren](Component.md#defaultchildren)
- [defaultStyles](Component.md#defaultstyles)
- [defaults](Component.md#defaults)
- [docsLink](Component.md#docslink)
- [hideFromInsertMenu](Component.md#hidefrominsertmenu)
- [image](Component.md#image)
- [inputs](Component.md#inputs)
- [models](Component.md#models)
- [name](Component.md#name)
- [noWrap](Component.md#nowrap)
- [requiredPermissions](Component.md#requiredpermissions)
- [requiresParent](Component.md#requiresparent)
- [screenshot](Component.md#screenshot)
- [tag](Component.md#tag)

## Properties

### canHaveChildren

• `Optional` **canHaveChildren**: `boolean`

Turn on if your component can accept children. Be sure to use in combination with
withChildren(YourComponent) like here
github.com/BuilderIO/builder/blob/master/examples/react-design-system/src/components/HeroWithChildren/HeroWithChildren.builder.js#L5

#### Defined in

[builder.class.ts:635](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L635)

___

### childRequirements

• `Optional` **childRequirements**: `Object`

Specify restrictions direct children must match

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `component?` | `string` | Simple way to say children must be a specific component name |
| `message` | `string` | Message to show when this doesn't match, e.g. "Children of 'Columns' must be a 'Column'" |
| `query?` | `any` | More advanced - specify a MongoDB-style query (using sift.js github.com/crcn/sift.js) of what the children objects should match, e.g.  **`example`**  query: {    // Child of this element must be a 'Button' or 'Text' component    'component.name': { $in: ['Button', 'Text'] }  } |

#### Defined in

[builder.class.ts:669](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L669)

___

### defaultChildren

• `Optional` **defaultChildren**: `BuilderElement`[]

Default children

#### Defined in

[builder.class.ts:646](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L646)

___

### defaultStyles

• `Optional` **defaultStyles**: `Object`

Default styles to apply when droppged into the Builder.io editor

**`example`**
```js
defaultStyles: {
  // large (default) breakpoint
  large: {
    backgroundColor: 'black'
  },
}
```

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[builder.class.ts:629](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L629)

___

### defaults

• `Optional` **defaults**: `Partial`<`BuilderElement`\>

Default options to merge in when creating this block

#### Defined in

[builder.class.ts:650](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L650)

___

### docsLink

• `Optional` **docsLink**: `string`

Link to a documentation page for this component

#### Defined in

[builder.class.ts:591](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L591)

___

### hideFromInsertMenu

• `Optional` **hideFromInsertMenu**: `boolean`

Hide your component in editor, useful for gradually deprecating components

#### Defined in

[builder.class.ts:656](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L656)

___

### image

• `Optional` **image**: `string`

Link to an image to be used as an icon for this component in Builder's editor

**`example`**
```js
image: 'https://some-cdn.com/my-icon-for-this-component.png'
```

#### Defined in

[builder.class.ts:600](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L600)

___

### inputs

• `Optional` **inputs**: [`Input`](Input.md)[]

Input schema for your component for users to fill in the options via a UI
that translate to this components props

#### Defined in

[builder.class.ts:611](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L611)

___

### models

• `Optional` **models**: `string`[]

Passing a list of model names will restrict using the component to only the models listed here, otherwise it'll be available for all models

#### Defined in

[builder.class.ts:664](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L664)

___

### name

• **name**: `string`

Name your component something unique, e.g. 'MyButton'. You can override built-in components
by registering a component with the same name, e.g. 'Text', to replace the built-in text component

#### Defined in

[builder.class.ts:585](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L585)

___

### noWrap

• `Optional` **noWrap**: `boolean`

Do not wrap a component in a dom element. Be sure to use {...props.attributes} with this option
like here github.com/BuilderIO/builder/blob/master/packages/react/src/blocks/forms/Input.tsx#L34

#### Defined in

[builder.class.ts:642](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L642)

___

### requiredPermissions

• `Optional` **requiredPermissions**: `Permission`[]

Use to restrict access to your component based on a the current user permissions
By default components will show to all users
for more information on permissions in builder check https://www.builder.io/c/docs/guides/roles-and-permissions

#### Defined in

[builder.class.ts:717](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L717)

___

### requiresParent

• `Optional` **requiresParent**: `Object`

Specify restrictions any parent must match

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `component?` | `string` | Simple way to say a parent must be a specific component name, e.g. 'Product box' |
| `message` | `string` | Message to show when this doesn't match, e.g. "'Add to cart' buttons must be within a 'Product box'" |
| `query?` | `any` | More advanced - specify a MongoDB-style query (using sift.js github.com/crcn/sift.js) of what at least one parent in the parents hierarchy should match, e.g.  **`example`**  query: {    // Thils element must be somewhere inside either a 'Product box' or 'Collection' component    'component.name': { $in: ['Product Box', 'Collection'] }  } |

#### Defined in

[builder.class.ts:690](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L690)

___

### screenshot

• `Optional` **screenshot**: `string`

Link to a screenshot shown when user hovers over the component in Builder's editor
use https://builder.io/upload to upload your screeshot, for easier resizing by Builder.

#### Defined in

[builder.class.ts:605](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L605)

___

### tag

• `Optional` **tag**: `string`

Custom tag name (for custom webcomponents only)

#### Defined in

[builder.class.ts:658](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L658)
