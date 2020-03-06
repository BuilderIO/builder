import './scripts/init-editing'

import { builder, Builder } from '@builder.io/sdk'
export { BuilderElement } from '@builder.io/sdk'

Builder.isReact = true

export { BuilderBlocks } from './components/builder-blocks.component'
export { BuilderBlock as BuilderBlockComponent } from './components/builder-block.component'
export { BuilderContent } from './components/builder-content.component'
import { BuilderPage } from './components/builder-page.component'
export { BuilderStoreContext } from './store/builder-store'
export { BuilderMetaContext } from './store/builder-meta'
export { BuilderAsyncRequestsContext } from './store/builder-async-requests'
export { withChildren } from './functions/with-children'

export { BuilderPage }
export { BuilderPage as BuilderComponent }

export { stringToFunction } from './functions/string-to-function'

export { builder, Builder }
export default builder
