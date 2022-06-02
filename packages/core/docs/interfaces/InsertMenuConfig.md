# Interface: InsertMenuConfig

Use this to register custom sections in the Insert menu, for instance
to make new sections to organize your custom components

![Example of what a custom section looks like](https://cdn.builder.io/api/v1/image/assets%2F7f7bbcf72a1a4d72bac5daa359e7befd%2Fe5f2792e9c0f44ed89a9dcb77b945858)

**`example`**
   Builder.register('insertMenu', {
     name: 'Our components',
     items: [
       { name: 'Hero' },
       { name: 'Double Columns' },
       { name: 'Triple Columns' },
       { name: 'Dynamic Columns' },
     ],
   })

You can make as many custom sections as you like

See a complete usage example [here](https://github.com/builderio/builder/blob/main/examples/react-design-system/src/builder-settings.js)

## Table of contents

### Properties

- [advanced](InsertMenuConfig.md#advanced)
- [items](InsertMenuConfig.md#items)
- [name](InsertMenuConfig.md#name)
- [persist](InsertMenuConfig.md#persist)
- [priority](InsertMenuConfig.md#priority)

## Properties

### advanced

• `Optional` **advanced**: `boolean`

#### Defined in

[builder.class.ts:683](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L683)

___

### items

• **items**: [`InsertMenuItem`](InsertMenuItem.md)[]

#### Defined in

[builder.class.ts:684](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L684)

___

### name

• **name**: `string`

#### Defined in

[builder.class.ts:680](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L680)

___

### persist

• `Optional` **persist**: `boolean`

#### Defined in

[builder.class.ts:682](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L682)

___

### priority

• `Optional` **priority**: `number`

#### Defined in

[builder.class.ts:681](https://github.com/builderio/builder/blob/5f50f6aa/packages/core/src/builder.class.ts#L681)
