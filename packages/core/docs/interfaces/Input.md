# Interface: Input

This is the interface for inputs in `Builder.registerComponent`

```js
Builder.registerComponent(MyComponent, {
  inputs: [{ name: 'title', type: 'text' }] // <- Input[]
})
```

Learn more about registering custom components [here](https://www.builder.io/c/docs/custom-react-components)

## Table of contents

### Properties

- [advanced](Input.md#advanced)
- [broadcast](Input.md#broadcast)
- [bubble](Input.md#bubble)
- [defaultValue](Input.md#defaultvalue)
- [enum](Input.md#enum)
- [friendlyName](Input.md#friendlyname)
- [helperText](Input.md#helpertext)
- [max](Input.md#max)
- [min](Input.md#min)
- [name](Input.md#name)
- [regex](Input.md#regex)
- [required](Input.md#required)
- [step](Input.md#step)
- [subFields](Input.md#subfields)
- [type](Input.md#type)

## Properties

### advanced

• `Optional` **advanced**: `boolean`

Set this to `true` to put this under the "show more" section of
the options editor. Useful for things that are more advanced
or more rarely used and don't need to be too prominent

#### Defined in

[builder.class.ts:556](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L556)

___

### broadcast

• `Optional` **broadcast**: `boolean`

Set this to `true` to show the editor for this input when
children of this component are selected. This is useful for things
like Tabs, such that users may not always select the Tabs component
directly but will still be looking for how to add additional tabs

#### Defined in

[builder.class.ts:526](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L526)

___

### bubble

• `Optional` **bubble**: `boolean`

Set this to `true` to show the editor for this input when
group locked parents of this component are selected. This is useful
to bubble up important inputs for locked groups, like text and images

#### Defined in

[builder.class.ts:532](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L532)

___

### defaultValue

• `Optional` **defaultValue**: `any`

A default value to use

#### Defined in

[builder.class.ts:471](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L471)

___

### enum

• `Optional` **enum**: `string`[] \| { `helperText?`: `string` ; `label`: `string` ; `value`: `any`  }[]

For "text" input type, specifying an enum will show a dropdown of options instead

#### Defined in

[builder.class.ts:538](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L538)

___

### friendlyName

• `Optional` **friendlyName**: `string`

A friendlier name to show in the UI if the component prop name is not ideal for end users

#### Defined in

[builder.class.ts:467](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L467)

___

### helperText

• `Optional` **helperText**: `string`

Additional text to render in the UI to give guidance on how to use this

**`example`**
```js
helperText: 'Be sure to use a proper URL, starting with "https://"'
```

#### Defined in

[builder.class.ts:492](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L492)

___

### max

• `Optional` **max**: `number`

Number field type validation maximum accepted input

#### Defined in

[builder.class.ts:510](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L510)

___

### min

• `Optional` **min**: `number`

Number field type validation minimum accepted input

#### Defined in

[builder.class.ts:514](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L514)

___

### name

• **name**: `string`

This is the name of the component prop this input represents

#### Defined in

[builder.class.ts:465](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L465)

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

[builder.class.ts:540](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L540)

___

### required

• `Optional` **required**: `boolean`

Is this input mandatory or not

#### Defined in

[builder.class.ts:480](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L480)

___

### step

• `Optional` **step**: `number`

Number field type step size when using arrows

#### Defined in

[builder.class.ts:518](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L518)

___

### subFields

• `Optional` **subFields**: [`Input`](Input.md)[]

#### Defined in

[builder.class.ts:483](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L483)

___

### type

• **type**: `string`

The type of input to use, such as 'text'

See all available inputs [here](https://www.builder.io/c/docs/custom-react-components#input-types)
and you can create your own custom input types and associated editor UIs with [plugins](https://www.builder.io/c/docs/extending/plugins)

#### Defined in

[builder.class.ts:478](https://github.com/builderio/builder/blob/faf038e7/packages/core/src/builder.class.ts#L478)
