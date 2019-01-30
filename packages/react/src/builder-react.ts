import { builder, Builder } from '@builder.io/sdk'

Builder.isReact = true

import './components/custom/Canvas'
import './components/custom/ContentColumns'
import './components/custom/Hero'
import './components/custom/Spacer'

export { BuilderBlocks } from './components/builder-blocks.component'
export { BuilderContent } from './components/builder-content.component'
import { BuilderPage } from './components/builder-page.component'
export { BuilderSimpleComponent } from './components/builder-simple.component'
export { BuilderStoreContext } from './store/builder-store'
export { BuilderAsyncRequestsContext } from './store/builder-async-requests'
export { BuilderBlock } from './decorators/builder-block.decorator'

export { BuilderPage }
export { BuilderPage as BuilderComponent }

// export { Button } from './blocks/Button'
export { Text } from './blocks/Text'
export { Columns } from './blocks/Columns'
export { Embed } from './blocks/Embed'
export { CustomCode } from './blocks/CustomCode'
export { Image } from './blocks/Image'
export { Video } from './blocks/Video'

export { builder, Builder }
export default builder

if (typeof window !== 'undefined') {
  window.parent.postMessage(
    {
      type: 'builder.isReactSdk',
      data: {
        value: true
      }
    },
    '*'
  )
}
