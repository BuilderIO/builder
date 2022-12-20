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
- [localized](Input.md#localized)
- [max](Input.md#max)
- [min](Input.md#min)
- [model](Input.md#model)
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

[builder.class.ts:579](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L579)

___

### broadcast

• `Optional` **broadcast**: `boolean`

Set this to `true` to show the editor for this input when
children of this component are selected. This is useful for things
like Tabs, such that users may not always select the Tabs component
directly but will still be looking for how to add additional tabs

#### Defined in

[builder.class.ts:545](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L545)

___

### bubble

• `Optional` **bubble**: `boolean`

Set this to `true` to show the editor for this input when
group locked parents of this component are selected. This is useful
to bubble up important inputs for locked groups, like text and images

#### Defined in

[builder.class.ts:551](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L551)

___

### defaultValue

• `Optional` **defaultValue**: `any`

A default value to use

#### Defined in

[builder.class.ts:490](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L490)

___

### enum

• `Optional` **enum**: `string`[] \| { `helperText?`: `string` ; `label`: `string` ; `value`: `any`  }[]

For "text" input type, specifying an enum will show a dropdown of options instead

#### Defined in

[builder.class.ts:561](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L561)

___

### friendlyName

• `Optional` **friendlyName**: `string`

A friendlier name to show in the UI if the component prop name is not ideal for end users

#### Defined in

[builder.class.ts:486](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L486)

___

### helperText

• `Optional` **helperText**: `string`

Additional text to render in the UI to give guidance on how to use this

**`example`**
```js
helperText: 'Be sure to use a proper URL, starting with "https://"'
```

#### Defined in

[builder.class.ts:511](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L511)

___

### localized

• `Optional` **localized**: `boolean`

Set this to `true` if you want this component to be translatable

#### Defined in

[builder.class.ts:555](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L555)

___

### max

• `Optional` **max**: `number`

Number field type validation maximum accepted input

#### Defined in

[builder.class.ts:529](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L529)

___

### min

• `Optional` **min**: `number`

Number field type validation minimum accepted input

#### Defined in

[builder.class.ts:533](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L533)

___

### model

• `Optional` **model**: `string`

Use optionally with inputs of type `reference`. Restricts the content entry picker to a specific model by name.

#### Defined in

[builder.class.ts:593](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L593)

___

### name

• **name**: `string`

This is the name of the component prop this input represents

#### Defined in

[builder.class.ts:484](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L484)

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

[builder.class.ts:563](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L563)

___

### required

• `Optional` **required**: `boolean`

Is this input mandatory or not

#### Defined in

[builder.class.ts:499](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L499)

___

### step

• `Optional` **step**: `number`

Number field type step size when using arrows

#### Defined in

[builder.class.ts:537](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L537)

___

### subFields

• `Optional` **subFields**: [`Input`](Input.md)[]

#### Defined in

[builder.class.ts:502](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L502)

___

### type

• **type**: `string`

The type of input to use, such as 'text'

See all available inputs [here](https://www.builder.io/c/docs/custom-react-components#input-types)
and you can create your own custom input types and associated editor UIs with [plugins](https://www.builder.io/c/docs/extending/plugins)

#### Defined in

[builder.class.ts:497](https://github.com/builderio/builder/blob/ee8e6f2d/packages/core/src/builder.class.ts#L497)
