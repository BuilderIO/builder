import { version } from '../package.json'
import { builder, Builder } from '@builder.io/sdk'
export { BuilderElement } from '@builder.io/sdk'

Builder.isReact = true

export { BuilderBlocks } from './components/builder-blocks.component'
export { BuilderBlock as BuilderBlockComponent } from './components/builder-block.component'
export { BuilderContent } from './components/builder-content.component'
import { BuilderPage, onChange } from './components/builder-page.component'
export { BuilderSimpleComponent } from './components/builder-simple.component'
export { BuilderStoreContext, BuilderStore } from './store/builder-store'
export { BuilderMetaContext } from './store/builder-meta'
export { BuilderAsyncRequestsContext } from './store/builder-async-requests'
export { BuilderBlock } from './decorators/builder-block.decorator'
export * from './functions/update-metadata'

export { withBuilder } from './functions/with-builder'
export { withChildren } from './functions/with-children'
export { noWrap } from './functions/no-wrap'

export { BuilderPage, onChange }
export { BuilderPage as BuilderComponent }

export { Text } from './blocks/Text'
export { Fragment } from './blocks/Fragment'
export { Columns } from './blocks/Columns'
export { Embed } from './blocks/Embed'
export { CustomCode } from './blocks/CustomCode'
export { Image, getSrcSet } from './blocks/Image'
export { Video } from './blocks/Video'
export { Symbol } from './blocks/Symbol'
export { Button } from './blocks/Button'
export { Section } from './blocks/Section'
export { StateProvider } from './blocks/StateProvider'
export { Router } from './blocks/Router'

export { Form } from './blocks/forms/Form'
export { FormInput } from './blocks/forms/Input'
export { FormSubmitButton } from './blocks/forms/Button'
export { Label } from './blocks/forms/Label' // advanced?
export { FormSelect } from './blocks/forms/Select' // advanced?
export { TextArea } from './blocks/forms/TextArea'
export { Img } from './blocks/raw/Img'

export { stringToFunction } from './functions/string-to-function'

export { builder, Builder }
export default builder

if (typeof window !== 'undefined') {
  window.parent?.postMessage(
    {
      type: 'builder.isReactSdk',
      data: {
        value: true,
        supportsPatchUpdates: 'v2', // location.href.includes('patchUpdates=true'),
        priorVersion: version
      }
    },
    '*'
  )
}
