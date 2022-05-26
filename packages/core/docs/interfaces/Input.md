[@builder.io/sdk](../README.md) / [Exports](../modules.md) / Input

# Interface: Input

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

[builder.class.ts:509](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L509)

___

### allowedFileTypes

• `Optional` **allowedFileTypes**: `string`[]

#### Defined in

[builder.class.ts:462](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L462)

___

### autoFocus

• `Optional` **autoFocus**: `boolean`

#### Defined in

[builder.class.ts:459](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L459)

___

### broadcast

• `Optional` **broadcast**: `boolean`

Set this to `true` to show the editor for this input when
children of this component are selected. This is useful for things
like Tabs, such that users may not always select the Tabs component
directly but will still be looking for how to add additional tabs

#### Defined in

[builder.class.ts:488](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L488)

___

### bubble

• `Optional` **bubble**: `boolean`

Set this to `true` to show the editor for this input when
group locked parents of this component are selected. This is useful
to bubble up important inputs for locked groups, like text and images

#### Defined in

[builder.class.ts:494](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L494)

___

### code

• `Optional` **code**: `boolean`

#### Defined in

[builder.class.ts:511](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L511)

___

### copyOnAdd

• `Optional` **copyOnAdd**: `boolean`

#### Defined in

[builder.class.ts:514](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L514)

___

### defaultValue

• `Optional` **defaultValue**: `any`

#### Defined in

[builder.class.ts:456](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L456)

___

### description

• `Optional` **description**: `string`

#### Defined in

[builder.class.ts:455](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L455)

___

### enum

• `Optional` **enum**: `string`[] \| { `helperText?`: `string` ; `label`: `string` ; `value`: `any`  }[]

#### Defined in

[builder.class.ts:496](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L496)

___

### friendlyName

• `Optional` **friendlyName**: `string`

#### Defined in

[builder.class.ts:454](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L454)

___

### helperText

• `Optional` **helperText**: `string`

#### Defined in

[builder.class.ts:461](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L461)

___

### hideFromUI

• `Optional` **hideFromUI**: `boolean`

#### Defined in

[builder.class.ts:467](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L467)

___

### imageHeight

• `Optional` **imageHeight**: `number`

#### Defined in

[builder.class.ts:463](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L463)

___

### imageWidth

• `Optional` **imageWidth**: `number`

#### Defined in

[builder.class.ts:464](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L464)

___

### max

• `Optional` **max**: `number`

Number field type validation maximum accepted input

#### Defined in

[builder.class.ts:472](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L472)

___

### mediaHeight

• `Optional` **mediaHeight**: `number`

#### Defined in

[builder.class.ts:465](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L465)

___

### mediaWidth

• `Optional` **mediaWidth**: `number`

#### Defined in

[builder.class.ts:466](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L466)

___

### min

• `Optional` **min**: `number`

Number field type validation minimum accepted input

#### Defined in

[builder.class.ts:476](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L476)

___

### modelId

• `Optional` **modelId**: `string`

#### Defined in

[builder.class.ts:468](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L468)

___

### name

• **name**: `string`

#### Defined in

[builder.class.ts:453](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L453)

___

### onChange

• `Optional` **onChange**: `string` \| `Function`

#### Defined in

[builder.class.ts:510](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L510)

___

### options

• `Optional` **options**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[builder.class.ts:495](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L495)

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

[builder.class.ts:498](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L498)

___

### required

• `Optional` **required**: `boolean`

#### Defined in

[builder.class.ts:458](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L458)

___

### richText

• `Optional` **richText**: `boolean`

#### Defined in

[builder.class.ts:512](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L512)

___

### showIf

• `Optional` **showIf**: `string` \| (`options`: `Map`<`string`, `any`\>) => `boolean`

#### Defined in

[builder.class.ts:513](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L513)

___

### step

• `Optional` **step**: `number`

Number field type step size when using arrows

#### Defined in

[builder.class.ts:480](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L480)

___

### subFields

• `Optional` **subFields**: [`Input`](Input.md)[]

#### Defined in

[builder.class.ts:460](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L460)

___

### type

• **type**: `string`

#### Defined in

[builder.class.ts:457](https://github.com/builderio/builder/blob/9edde48f/packages/core/src/builder.class.ts#L457)
