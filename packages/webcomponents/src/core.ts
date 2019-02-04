// Maybe don't include for lite version
import './polyfills/custom-element-es5-adapter.js'
import { builder, Builder } from '@builder.io/sdk'
import { version } from '../package.json'
import './elements'

export const VERSION = version

// TODO: export version
export { builder, Builder }
