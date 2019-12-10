import { GetContentOptions, Builder, builder } from '@builder.io/sdk'

const importReact = () => import('@builder.io/react')
const importWidgets = () => import('@builder.io/widgets')

console.debug('Elements version 6')

const componentName = process.env.ANGULAR
  ? 'builder-component-element'
  : 'builder-component'

if (Builder.isIframe) {
  importReact()
  importWidgets()
  import('@builder.io/email')
}

function onReady(cb: Function) {
  if (document.readyState !== 'loading') {
    cb()
  } else {
    document.addEventListener('DOMContentLoaded', cb as any)
  }
}

if (Builder.isBrowser && !customElements.get(componentName)) {
  const BuilderWC = {
    Builder,
    builder
  }
  ;(window as any).BuilderWC = BuilderWC

  const { builderWcLoadCallbacks } = window as any
  if (builderWcLoadCallbacks) {
    if (typeof builderWcLoadCallbacks === 'function') {
      try {
        builderWcLoadCallbacks(BuilderWC)
      } catch (err) {
        console.error(err)
      }
    } else {
      try {
        builderWcLoadCallbacks.forEach((cb: any) => {
          try {
            cb(BuilderWC)
          } catch (err) {
            console.error(err)
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  const inject = () => {
    const selector = '.builder-component-wrap.builder-to-embed'
    const matches = document.querySelectorAll(selector)
    for (let i = 0; i < matches.length; i++) {
      const el = matches[i]
      const attrs = el.attributes
      const newEl = document.createElement(componentName)
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i]
        if (attr.name.indexOf('data-') === 0) {
          const name =
            attr.name.indexOf('data-') === 0 ? attr.name.slice(5) : attr.name
          const value = attr.value
          // TODO: allow properties too
          newEl.setAttribute(name, value)
        }
      }
      el.classList.remove('builder-to-embed')

      // Transfer children
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i]
        child.remove()
        // newEl.appendChild(child)
      }
      el.innerHTML = ''

      el.appendChild(newEl)
    }
  }

  inject()
  onReady(inject)

  class BuilderPageElement extends HTMLElement {
    private previousName = ''
    private subscriptions: Function[] = []
    // TODO: do this in core SDK
    private trackedClick = false
    data: any

    prerender = true

    private _options: GetContentOptions = {}

    get options() {
      return {
        rev: this.getAttribute('rev') || undefined,
        ...this._options
      }
    }

    set options(options) {
      this._options = options
    }

    private getOptionsFromAttribute() {
      const options = this.getAttribute('options')
      if (options && typeof options === 'string' && options.trim()[0] === '{') {
        // TODO: use JSON5
        this._options = JSON.parse(options)
      }

      const slot = this.getAttribute('slot')
      if (slot) {
        const options = (this._options = this._options || {})
        const query = options.query || (options.query = {})
        query['data.slot'] = slot
      }
    }

    connected = false

    connectedCallback() {
      if (this.connected) {
        return
      }
      this.connected = true
      const prerenderAttr = this.getAttribute('prerender')
      if (prerenderAttr) {
        this.prerender = prerenderAttr === 'false' ? false : this.prerender
      }

      window.parent.postMessage(
        {
          type: 'builder.isReactSdk',
          data: {
            value: true
          }
        },
        '*'
      )

      this.getOptionsFromAttribute()
      this.addEventListener('remove', () => this.unsubscribe())
      this.getContent()
    }

    attributeChangedCallback() {
      // TODO: listen to properties too
      this.getOptionsFromAttribute()
      this.getContent()
    }

    disconnectedCallback() {
      this.unsubscribe()
    }

    loaded() {
      this.classList.add('builder-loaded')
    }

    // When loaded from the server
    get currentContent() {
      const name = this.getAttribute('name') || this.getAttribute('model')
      // TODO: get this to work with nested blocks
      const existing = this.querySelector(`[data-builder-component="${name}"]`)
      if (existing) {
        const id = existing.getAttribute('data-builder-content-id')
        const variationId = existing.getAttribute('data-builder-variation-id')
        if (id) {
          return {
            id,
            testVariationId: variationId || undefined
          }
        }
      }
      return null
    }

    getContent(fresh = false) {
      const token =
        this.getAttribute('token') || this.getAttribute('auth-token')
      if (token) {
        builder.authToken = token
      }
      const key = this.getAttribute('api-key')
      if (key && key !== builder.apiKey) {
        builder.apiKey = key
      }

      if (!builder.apiKey) {
        const subscription = builder['apiKey$'].subscribe((key?: string) => {
          if (key) {
            this.getContent()
          }
        })
        this.subscriptions.push(() => subscription.unsubscribe())

        setTimeout(() => {
          if (!builder.apiKey) {
            throw new Error(
              'Builder API key not found. Please see our docs for how to provide your API key https://builder.io/c/docs'
            )
          }
        }, 10000)

        // TODO: how test if actually editing. have a message to receive and flag that editing his happening
        if (!Builder.isIframe) {
          return
        }
      }

      const name = this.getAttribute('name') || this.getAttribute('model')
      // TODO: only judge this on key, or remove this line entirely as the
      // SDK handles this anyway
      if (name === this.previousName && !this.getAttribute('key')) {
        return false
      }

      const entry = this.getAttribute('entry')

      if (!this.prerender || !builder.apiKey || fresh) {
        this.loadReact(entry ? { id: entry } : null)
        return
      }

      this.unsubscribe()
      if (!name) {
        return false
      }

      // const { currentContent } = this
      const currentContent = fresh ? null : this.currentContent
      if (currentContent && !Builder.isEditing) {
        this.data = currentContent
        this.loaded()
        this.loadReact(this.data)
        return
      }

      this.previousName = name
      this.classList.add('builder-loading')
      let unsubscribed = false
      const slot = this.getAttribute('slot')

      const subscription = builder
        .get(name, {
          key:
            this.getAttribute('key') ||
            (slot ? `slot:${slot}` : null) ||
            (!Builder.isEditing && (this.getAttribute('entry') || name!)) ||
            undefined,
          entry: entry || undefined,
          ...this.options,
          prerender: true
        })
        .subscribe(
          (data: any) => {
            if (unsubscribed) {
              console.warn('Unsubscribe didnt work!')
              return
            }
            this.classList.remove('builder-loading')
            this.loaded()
            if (!data) {
              this.classList.add('builder-no-content-found')
              const loadEvent = new CustomEvent('load', { detail: data })
              this.dispatchEvent(loadEvent)
              return
            }
            if (this.classList.contains('builder-editor-injected')) {
              this.unsubscribe()
            } else {
              this.data = data
              if (data.data && data.data.html) {
                this.innerHTML = data.data.html
                const loadEvent = new CustomEvent('htmlload', { detail: data })
                this.dispatchEvent(loadEvent)
              }

              this.loadReact(data)
              subscription.unsubscribe()
              unsubscribed = true
            }
          },
          (error: any) => {
            // Server render failed, not the end of the world, load react anyway
            this.loadReact()
            subscription.unsubscribe()
            unsubscribed = true
          }
        )
      this.subscriptions.push(() => subscription.unsubscribe())
    }

    async loadReact(data?: any) {
      // Hack for now to not load shopstyle on react despite them using the old component format
      if (
        typeof location !== 'undefined' &&
        !Builder.isIframe &&
        location.hostname.indexOf('shopstyle') > -1
      ) {
        return
      }

      this.unsubscribe()
      const name =
        this.getAttribute('name') ||
        this.getAttribute('model') ||
        this.getAttribute('model-name')

      const getReactPromise = importReact() // TODO: only import what needed based on what comes back
      const getWidgetsPromise = importWidgets()

      let emailPromise: Promise<any> | null = null
      if (name === 'email') {
        emailPromise = import('@builder.io/email')
      }

      let unsubscribed = false

      const slot = this.getAttribute('slot')
      if (
        !this.prerender ||
        (Builder.isIframe && (!builder.apiKey || builder.apiKey === 'DEMO'))
      ) {
        const { BuilderPage } = await getReactPromise
        await getWidgetsPromise
        // Ensure styles don't load twice
        BuilderPage.renderInto(
          this,
          {
            modelName: name!,
            emailMode:
              ((this.options as any) || {}).emailMode ||
              this.getAttribute('email-mode') === 'true',
            options: {
              ...this.options,
              key:
                this.getAttribute('key') ||
                (slot ? `slot:${slot}` : null) ||
                (Builder.isEditing
                  ? name!
                  : this.getAttribute('entry') || name! || undefined)
            }
          },
          this.getAttribute('hydrate') !== 'false'
        )
        return
      }

      const subscription = builder
        .get(name!, {
          key:
            this.getAttribute('key') ||
            (slot ? `slot:${slot}` : null) ||
            (Builder.isEditing ? name! : this.getAttribute('entry') || name!),
          ...this.options,
          entry: data ? data.id : this.options.entry || undefined,
          prerender: false
        })
        .subscribe(
          async data => {
            if (unsubscribed) {
              console.debug('Unsubscribe didnt work!')
              return
            }

            const { BuilderPage } = await getReactPromise
            await getWidgetsPromise
            if (emailPromise) {
              await emailPromise
            }

            const loadEvent = new CustomEvent('load', { detail: data })
            this.dispatchEvent(loadEvent)

            const { currentContent } = this

            BuilderPage.renderInto(
              this,
              {
                modelName: name!,
                emailMode:
                  ((this.options as any) || {}).emailMode ||
                  this.getAttribute('email-mode') === 'true',
                options: {
                  ...this.options,
                  entry: data ? data.id : undefined,
                  initialContent: data ? [data] : undefined,
                  // TODO: make this a settable property too
                  key:
                    this.getAttribute('key') ||
                    (slot ? `slot:${slot}` : null) ||
                    (Builder.isEditing ? name! : (data && data.id) || undefined)
                }
              },
              this.getAttribute('hydrate') !== 'false' // TODO: query param override builder.hydrate
            )

            subscription.unsubscribe()
            unsubscribed = true

            if (Builder.isIframe) {
              setTimeout(() => {
                parent.postMessage({ type: 'builder.updateContent' }, '*')
                setTimeout(() => {
                  parent.postMessage(
                    { type: 'builder.sdkInjected', data: { modelName: name } },
                    '*'
                  )
                }, 100)
              }, 100)
            }
          },
          async (error: any) => {
            if (Builder.isEditing) {
              const { BuilderPage } = await getReactPromise
              await getWidgetsPromise
              if (emailPromise) {
                await emailPromise
              }
              BuilderPage.renderInto(
                this,
                {
                  modelName: name!,
                  emailMode:
                    ((this.options as any) || {}).emailMode ||
                    this.getAttribute('email-mode') === 'true',
                  options: {
                    ...this.options,
                    entry: data ? data.id : undefined,
                    initialContent: data ? [data] : undefined,
                    key:
                      this.getAttribute('key') ||
                      (slot ? `slot:${slot}` : null) ||
                      (Builder.isEditing
                        ? name!
                        : (data && data.id) || undefined)
                    // TODO: specify variation?
                  }
                },
                this.getAttribute('hydrate') !== 'false'
              )
            } else {
              console.warn('Builder webcomponent error:', error)
              this.classList.add('builder-errored')
              this.classList.add('builder-loaded')
              this.classList.remove('builder-loading')
              const errorEvent = new CustomEvent('error', { detail: error })
              this.dispatchEvent(errorEvent)
            }
          }
        )

      this.subscriptions.push(() => subscription.unsubscribe())
    }

    unsubscribe() {
      if (this.subscriptions) {
        this.subscriptions.forEach(fn => fn())
        this.subscriptions = []
      }
    }
  }

  customElements.define(componentName, BuilderPageElement)

  class BuilderInit extends HTMLElement {
    init() {
      const key = this.getAttribute('api-key') || this.getAttribute('key')
      const canTrack = this.getAttribute('canTrack') !== 'false'
      if (key && builder.apiKey !== key) {
        builder.apiKey = key
      }
      if (builder.canTrack !== canTrack) {
        builder.canTrack = canTrack
      }
    }

    connectedCallback() {
      this.init()
    }

    attributeChangedCallback() {
      this.init()
    }
  }

  customElements.define('builder-init', BuilderInit)
}
