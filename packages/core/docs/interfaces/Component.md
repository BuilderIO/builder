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
- [class](Component.md#class)
- [defaultChildren](Component.md#defaultchildren)
- [defaultStyles](Component.md#defaultstyles)
- [defaults](Component.md#defaults)
- [description](Component.md#description)
- [docsLink](Component.md#docslink)
- [fragment](Component.md#fragment)
- [friendlyName](Component.md#friendlyname)
- [hideFromInsertMenu](Component.md#hidefrominsertmenu)
- [hooks](Component.md#hooks)
- [image](Component.md#image)
- [inputs](Component.md#inputs)
- [models](Component.md#models)
- [name](Component.md#name)
- [noWrap](Component.md#nowrap)
- [requiredPermissions](Component.md#requiredpermissions)
- [requiresParent](Component.md#requiresparent)
- [static](Component.md#static)
- [tag](Component.md#tag)
- [type](Component.md#type)

## Properties

### canHaveChildren

• `Optional` **canHaveChildren**: `boolean`

Turn on if your component can accept children. Be sure to use in combination with
withChildren(YourComponent) like here
github.com/BuilderIO/builder/blob/master/examples/react-design-system/src/components/HeroWithChildren/HeroWithChildren.builder.js#L5

#### Defined in

[builder.class.ts:563](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L563)

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

[builder.class.ts:591](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L591)

___

### class

• `Optional` **class**: `any`

#### Defined in

[builder.class.ts:555](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L555)

___

### defaultChildren

• `Optional` **defaultChildren**: `BuilderElement`[]

Default children

#### Defined in

[builder.class.ts:573](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L573)

___

### defaultStyles

• `Optional` **defaultStyles**: `Object`

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[builder.class.ts:557](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L557)

___

### defaults

• `Optional` **defaults**: `Partial`<`BuilderElement`\>

#### Defined in

[builder.class.ts:574](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L574)

___

### description

• `Optional` **description**: `string`

#### Defined in

[builder.class.ts:545](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L545)

___

### docsLink

• `Optional` **docsLink**: `string`

Link to a documentation page for this component

#### Defined in

[builder.class.ts:549](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L549)

___

### fragment

• `Optional` **fragment**: `boolean`

#### Defined in

[builder.class.ts:564](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L564)

___

### friendlyName

• `Optional` **friendlyName**: `string`

not yet implemented

#### Defined in

[builder.class.ts:632](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L632)

___

### hideFromInsertMenu

• `Optional` **hideFromInsertMenu**: `boolean`

Hide your component in editor, useful for gradually deprecating components

#### Defined in

[builder.class.ts:579](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L579)

___

### hooks

• `Optional` **hooks**: `Object`

#### Index signature

▪ [key: `string`]: `string` \| `Function`

#### Defined in

[builder.class.ts:575](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L575)

___

### image

• `Optional` **image**: `string`

#### Defined in

[builder.class.ts:550](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L550)

___

### inputs

• `Optional` **inputs**: [`Input`](Input.md)[]

Input schema for your component for users to fill in the options

#### Defined in

[builder.class.ts:554](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L554)

___

### models

• `Optional` **models**: `string`[]

Passing a list of model names will restrict using the component to only the models listed here, otherwise it'll be available for all models

#### Defined in

[builder.class.ts:586](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L586)

___

### name

• **name**: `string`

Name your component something unique, e.g. 'MyButton'. You can override built-in components
by registering a component with the same name, e.g. 'Text', to replace the built-in text component

#### Defined in

[builder.class.ts:544](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L544)

___

### noWrap

• `Optional` **noWrap**: `boolean`

Do not wrap a component in a dom element. Be sure to use {...props.attributes} with this option
like here github.com/BuilderIO/builder/blob/master/packages/react/src/blocks/forms/Input.tsx#L34

#### Defined in

[builder.class.ts:569](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L569)

___

### requiredPermissions

• `Optional` **requiredPermissions**: `Permission`[]

Use to restrict access to your component based on a the current user permissions
By default components will show to all users
for more information on permissions in builder check https://www.builder.io/c/docs/guides/roles-and-permissions

#### Defined in

[builder.class.ts:639](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L639)

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

[builder.class.ts:612](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L612)

___

### static

• `Optional` **static**: `boolean`

#### Defined in

[builder.class.ts:582](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L582)

___

### tag

• `Optional` **tag**: `string`

#### Defined in

[builder.class.ts:581](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L581)

___

### type

• `Optional` **type**: ``"react"`` \| ``"angular"`` \| ``"webcomponent"`` \| ``"vue"``

#### Defined in

[builder.class.ts:556](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L556)
