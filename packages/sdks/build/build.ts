import { componentToReactNative, parseJsx } from '@jsx-lite/core'

const cwd = process.cwd()
const DIST_DIR = `${cwd}/dist`

export async function build() {
  
}

if (require.main === module) {
  build().catch(console.error)
}