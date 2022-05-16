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

[builder.class.ts:494](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L494)

___

### allowedFileTypes

• `Optional` **allowedFileTypes**: `string`[]

#### Defined in

[builder.class.ts:447](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L447)

___

### autoFocus

• `Optional` **autoFocus**: `boolean`

#### Defined in

[builder.class.ts:444](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L444)

___

### broadcast

• `Optional` **broadcast**: `boolean`

Set this to `true` to show the editor for this input when
children of this component are selected. This is useful for things
like Tabs, such that users may not always select the Tabs component
directly but will still be looking for how to add additional tabs

#### Defined in

[builder.class.ts:473](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L473)

___

### bubble

• `Optional` **bubble**: `boolean`

Set this to `true` to show the editor for this input when
group locked parents of this component are selected. This is useful
to bubble up important inputs for locked groups, like text and images

#### Defined in

[builder.class.ts:479](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L479)

___

### code

• `Optional` **code**: `boolean`

#### Defined in

[builder.class.ts:496](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L496)

___

### copyOnAdd

• `Optional` **copyOnAdd**: `boolean`

#### Defined in

[builder.class.ts:499](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L499)

___

### defaultValue

• `Optional` **defaultValue**: `any`

#### Defined in

[builder.class.ts:441](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L441)

___

### description

• `Optional` **description**: `string`

#### Defined in

[builder.class.ts:440](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L440)

___

### enum

• `Optional` **enum**: `string`[] \| { `helperText?`: `string` ; `label`: `string` ; `value`: `any`  }[]

#### Defined in

[builder.class.ts:481](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L481)

___

### friendlyName

• `Optional` **friendlyName**: `string`

#### Defined in

[builder.class.ts:439](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L439)

___

### helperText

• `Optional` **helperText**: `string`

#### Defined in

[builder.class.ts:446](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L446)

___

### hideFromUI

• `Optional` **hideFromUI**: `boolean`

#### Defined in

[builder.class.ts:452](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L452)

___

### imageHeight

• `Optional` **imageHeight**: `number`

#### Defined in

[builder.class.ts:448](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L448)

___

### imageWidth

• `Optional` **imageWidth**: `number`

#### Defined in

[builder.class.ts:449](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L449)

___

### max

• `Optional` **max**: `number`

Number field type validation maximum accepted input

#### Defined in

[builder.class.ts:457](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L457)

___

### mediaHeight

• `Optional` **mediaHeight**: `number`

#### Defined in

[builder.class.ts:450](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L450)

___

### mediaWidth

• `Optional` **mediaWidth**: `number`

#### Defined in

[builder.class.ts:451](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L451)

___

### min

• `Optional` **min**: `number`

Number field type validation minimum accepted input

#### Defined in

[builder.class.ts:461](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L461)

___

### modelId

• `Optional` **modelId**: `string`

#### Defined in

[builder.class.ts:453](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L453)

___

### name

• **name**: `string`

#### Defined in

[builder.class.ts:438](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L438)

___

### onChange

• `Optional` **onChange**: `string` \| `Function`

#### Defined in

[builder.class.ts:495](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L495)

___

### options

• `Optional` **options**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[builder.class.ts:480](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L480)

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

[builder.class.ts:483](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L483)

___

### required

• `Optional` **required**: `boolean`

#### Defined in

[builder.class.ts:443](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L443)

___

### richText

• `Optional` **richText**: `boolean`

#### Defined in

[builder.class.ts:497](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L497)

___

### showIf

• `Optional` **showIf**: `string` \| (`options`: `Map`<`string`, `any`\>) => `boolean`

#### Defined in

[builder.class.ts:498](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L498)

___

### step

• `Optional` **step**: `number`

Number field type step size when using arrows

#### Defined in

[builder.class.ts:465](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L465)

___

### subFields

• `Optional` **subFields**: [`Input`](Input.md)[]

#### Defined in

[builder.class.ts:445](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L445)

___

### type

• **type**: `string`

#### Defined in

[builder.class.ts:442](https://github.com/builderio/builder/blob/8c1a05a9/packages/core/src/builder.class.ts#L442)
