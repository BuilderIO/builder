export { render }

import { createApp } from './app'

async function render(pageContext) {
  const app = createApp(pageContext)
  app.mount('#app')
}
