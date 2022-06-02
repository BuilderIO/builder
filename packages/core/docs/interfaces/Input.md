[@builder.io/sdk](../README.md) / [Exports](../modules.md) / Input

# Interface: Input

This is the interface for inputs in Builder.registerComponent

```js
Builder.registerComponent(MyComponent, {
  inputs: [...] // <- Input[]
})
```

## Table of contents

### Properties

- [advanced](Input.md#advanced)
- [allowedFileTypes](Input.md#allowedfiletypes)
- [autoFocus](Input.md#autofocus)
- [broadcast](Input.md#broadcast)
- [bubble](Input.md#bubble)
- [code](Input.md#code)
- [copyOnAdd](Input.md#copyonadd)
- [defaultValue](Input.md#defaultvalue)
- [description](Input.md#description)
- [enum](Input.md#enum)
- [friendlyName](Input.md#friendlyname)
- [helperText](Input.md#helpertext)
- [hideFromUI](Input.md#hidefromui)
- [imageHeight](Input.md#imageheight)
- [imageWidth](Input.md#imagewidth)
- [max](Input.md#max)
- [mediaHeight](Input.md#mediaheight)
- [mediaWidth](Input.md#mediawidth)
- [min](Input.md#min)
- [modelId](Input.md#modelid)
- [name](Input.md#name)
- [onChange](Input.md#onchange)
- [options](Input.md#options)
- [regex](Input.md#regex)
- [required](Input.md#required)
- [richText](Input.md#richtext)
- [showIf](Input.md#showif)
- [step](Input.md#step)
- [subFields](Input.md#subfields)
- [type](Input.md#type)

## Properties

### advanced

• `Optional` **advanced**: `boolean`

#### Defined in

[builder.class.ts:518](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L518)

___

### allowedFileTypes

• `Optional` **allowedFileTypes**: `string`[]

#### Defined in

[builder.class.ts:471](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L471)

___

### autoFocus

• `Optional` **autoFocus**: `boolean`

#### Defined in

[builder.class.ts:468](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L468)

___

### broadcast

• `Optional` **broadcast**: `boolean`

Set this to `true` to show the editor for this input when
children of this component are selected. This is useful for things
like Tabs, such that users may not always select the Tabs component
directly but will still be looking for how to add additional tabs

#### Defined in

[builder.class.ts:497](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L497)

___

### bubble

• `Optional` **bubble**: `boolean`

Set this to `true` to show the editor for this input when
group locked parents of this component are selected. This is useful
to bubble up important inputs for locked groups, like text and images

#### Defined in

[builder.class.ts:503](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L503)

___

### code

• `Optional` **code**: `boolean`

#### Defined in

[builder.class.ts:520](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L520)

___

### copyOnAdd

• `Optional` **copyOnAdd**: `boolean`

#### Defined in

[builder.class.ts:523](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L523)

___

### defaultValue

• `Optional` **defaultValue**: `any`

#### Defined in

[builder.class.ts:465](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L465)

___

### description

• `Optional` **description**: `string`

#### Defined in

[builder.class.ts:464](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L464)

___

### enum

• `Optional` **enum**: `string`[] \| { `helperText?`: `string` ; `label`: `string` ; `value`: `any`  }[]

#### Defined in

[builder.class.ts:505](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L505)

___

### friendlyName

• `Optional` **friendlyName**: `string`

#### Defined in

[builder.class.ts:463](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L463)

___

### helperText

• `Optional` **helperText**: `string`

#### Defined in

[builder.class.ts:470](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L470)

___

### hideFromUI

• `Optional` **hideFromUI**: `boolean`

#### Defined in

[builder.class.ts:476](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L476)

___

### imageHeight

• `Optional` **imageHeight**: `number`

#### Defined in

[builder.class.ts:472](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L472)

___

### imageWidth

• `Optional` **imageWidth**: `number`

#### Defined in

[builder.class.ts:473](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L473)

___

### max

• `Optional` **max**: `number`

Number field type validation maximum accepted input

#### Defined in

[builder.class.ts:481](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L481)

___

### mediaHeight

• `Optional` **mediaHeight**: `number`

#### Defined in

[builder.class.ts:474](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L474)

___

### mediaWidth

• `Optional` **mediaWidth**: `number`

#### Defined in

[builder.class.ts:475](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L475)

___

### min

• `Optional` **min**: `number`

Number field type validation minimum accepted input

#### Defined in

[builder.class.ts:485](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L485)

___

### modelId

• `Optional` **modelId**: `string`

#### Defined in

[builder.class.ts:477](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L477)

___

### name

• **name**: `string`

#### Defined in

[builder.class.ts:462](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L462)

___

### onChange

• `Optional` **onChange**: `string` \| `Function`

#### Defined in

[builder.class.ts:519](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L519)

___

### options

• `Optional` **options**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[builder.class.ts:504](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L504)

___

### regex

• `Optional` **regex**: `Object`

Regex field validation for all string types (text, longText, html, url, etc)

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | Friendly message to display to end-users if the regex fails, e.g. "You must use a relative url starting with '/...' " |
| `options?` | `string` | flags for the RegExp constructor, e.g. "gi" |
| `pattern` | `string` | pattern to test, like "^\/[a-z]$" |

#### Defined in

[builder.class.ts:507](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L507)

___

### required

• `Optional` **required**: `boolean`

#### Defined in

[builder.class.ts:467](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L467)

___

### richText

• `Optional` **richText**: `boolean`

#### Defined in

[builder.class.ts:521](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L521)

___

### showIf

• `Optional` **showIf**: `string` \| (`options`: `Map`<`string`, `any`\>) => `boolean`

#### Defined in

[builder.class.ts:522](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L522)

___

### step

• `Optional` **step**: `number`

Number field type step size when using arrows

#### Defined in

[builder.class.ts:489](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L489)

___

### subFields

• `Optional` **subFields**: [`Input`](Input.md)[]

#### Defined in

[builder.class.ts:469](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L469)

___

### type

• **type**: `string`

#### Defined in

[builder.class.ts:466](https://github.com/builderio/builder/blob/569bb57f/packages/core/src/builder.class.ts#L466)
