[@builder.io/sdk](../README.md) / [Exports](../modules.md) / Component

# Interface: Component

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

[builder.class.ts:541](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L541)

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

[builder.class.ts:569](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L569)

___

### class

• `Optional` **class**: `any`

#### Defined in

[builder.class.ts:533](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L533)

___

### defaultChildren

• `Optional` **defaultChildren**: `BuilderElement`[]

Default children

#### Defined in

[builder.class.ts:551](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L551)

___

### defaultStyles

• `Optional` **defaultStyles**: `Object`

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[builder.class.ts:535](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L535)

___

### defaults

• `Optional` **defaults**: `Partial`<`BuilderElement`\>

#### Defined in

[builder.class.ts:552](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L552)

___

### description

• `Optional` **description**: `string`

#### Defined in

[builder.class.ts:523](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L523)

___

### docsLink

• `Optional` **docsLink**: `string`

Link to a documentation page for this component

#### Defined in

[builder.class.ts:527](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L527)

___

### fragment

• `Optional` **fragment**: `boolean`

#### Defined in

[builder.class.ts:542](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L542)

___

### friendlyName

• `Optional` **friendlyName**: `string`

not yet implemented

#### Defined in

[builder.class.ts:610](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L610)

___

### hideFromInsertMenu

• `Optional` **hideFromInsertMenu**: `boolean`

Hide your component in editor, useful for gradually deprecating components

#### Defined in

[builder.class.ts:557](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L557)

___

### hooks

• `Optional` **hooks**: `Object`

#### Index signature

▪ [key: `string`]: `string` \| `Function`

#### Defined in

[builder.class.ts:553](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L553)

___

### image

• `Optional` **image**: `string`

#### Defined in

[builder.class.ts:528](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L528)

___

### inputs

• `Optional` **inputs**: [`Input`](Input.md)[]

Input schema for your component for users to fill in the options

#### Defined in

[builder.class.ts:532](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L532)

___

### models

• `Optional` **models**: `string`[]

Passing a list of model names will restrict using the component to only the models listed here, otherwise it'll be available for all models

#### Defined in

[builder.class.ts:564](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L564)

___

### name

• **name**: `string`

Name your component something unique, e.g. 'MyButton'. You can override built-in components
by registering a component with the same name, e.g. 'Text', to replace the built-in text component

#### Defined in

[builder.class.ts:522](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L522)

___

### noWrap

• `Optional` **noWrap**: `boolean`

Do not wrap a component in a dom element. Be sure to use {...props.attributes} with this option
like here github.com/BuilderIO/builder/blob/master/packages/react/src/blocks/forms/Input.tsx#L34

#### Defined in

[builder.class.ts:547](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L547)

___

### requiredPermissions

• `Optional` **requiredPermissions**: `Permission`[]

Use to restrict access to your component based on a the current user permissions
By default components will show to all users
for more information on permissions in builder check https://www.builder.io/c/docs/guides/roles-and-permissions

#### Defined in

[builder.class.ts:617](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L617)

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

[builder.class.ts:590](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L590)

___

### static

• `Optional` **static**: `boolean`

#### Defined in

[builder.class.ts:560](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L560)

___

### tag

• `Optional` **tag**: `string`

#### Defined in

[builder.class.ts:559](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L559)

___

### type

• `Optional` **type**: ``"react"`` \| ``"angular"`` \| ``"webcomponent"`` \| ``"vue"``

#### Defined in

[builder.class.ts:534](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L534)
