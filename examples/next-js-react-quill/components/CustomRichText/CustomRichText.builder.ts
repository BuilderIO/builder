import { Builder } from '@builder.io/react/lite'
import CustomRichText from './CustomRichText'

Builder.registerComponent(CustomRichText, {
  name: 'RichText',
  image: 'https://unpkg.com/css.gg@2.0.0/icons/svg/format-text.svg',
  inputs: [
    {
      name: 'body',
      friendlyName: 'Text body',
      type: 'customRichText',
    },
  ],
})
