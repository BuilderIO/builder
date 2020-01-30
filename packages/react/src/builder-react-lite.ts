import { builder, Builder } from '@builder.io/sdk'
export { BuilderElement } from '@builder.io/sdk'

Builder.isReact = true

export { BuilderBlocks } from './components/builder-blocks.component'
export { BuilderBlock as BuilderBlockComponent } from './components/builder-block.component'
export { BuilderContent } from './components/builder-content.component'
import { BuilderPage } from './components/builder-page.component'
export { BuilderSimpleComponent } from './components/builder-simple.component'
export { BuilderStoreContext } from './store/builder-store'
export { BuilderMetaContext } from './store/builder-meta'
export { BuilderAsyncRequestsContext } from './store/builder-async-requests'
export { BuilderBlock } from './decorators/builder-block.decorator'

export { withBuilder } from './functions/with-builder'

export { BuilderPage }
export { BuilderPage as BuilderComponent }

export { stringToFunction } from './functions/string-to-function'

export { builder, Builder }
export default builder

if (typeof window !== 'undefined') {
  window.parent?.postMessage(
    {
      type: 'builder.isReactSdk',
      data: {
        value: true
      }
    },
    '*'
  )
}

