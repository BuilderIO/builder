import { Builder } from '@builder.io/sdk'
import { BuilderPage } from '@builder.io/react'

function tryJsonParse(string: string) {
  try {
    return JSON.parse(string)
  } catch {
    return string
  }
}

function deserializeValue(value: string) {
  const firstChar = value.trim()[0]
  // If starts with {, [, or a number assume it is JSON
  return /\{\d\[/.test(firstChar) ? tryJsonParse(value) : value
}

if (Builder.isBrowser) {
  class BuilderCanvas extends HTMLElement {
    connectedCallback() {
      const attributes: { [key: string]: string } = {}
      for (let i = 0; i < this.attributes.length; i++) {
        const attr = this.attributes[i]
        if (attr.value) {
          attributes[attr.name] = deserializeValue(attr.value)
        }
      }

      this.classList.add('builder-loading')
      BuilderPage.renderInto(this, {
        // TODO: listen for changes to attrs
        // TODO: support properties (for frameworks like react, vue, ng, etc) and listen to setters
        ...attributes,
        contentLoaded: data => {
          this.classList.remove('builder-loading')
          this.classList.add('builder-loaded')
          if (!data) {
            this.classList.add('builder-no-content-found')
          }
          // Full data may be a second arg
          this.dispatchEvent(new CustomEvent('load', { detail: data }))
        },
        contentError: err => {
          this.classList.add('builder-loaded')
          this.classList.remove('builder-loading')
          this.classList.add('builder-errored')
          this.dispatchEvent(new CustomEvent('error', { detail: err }))
        }
      })
    }
  }
  customElements.define('builder-canvas', BuilderCanvas)
}
