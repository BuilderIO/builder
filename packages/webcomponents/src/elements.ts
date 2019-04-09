import { GetContentOptions, Builder, builder } from '@builder.io/sdk'
// import { BuilderPage } from '@builder.io/react'

if (Builder.isIframe) {
  // TODO: systemjs only
  import('@builder.io/react')
  // Register all the widgets
  import('@builder.io/widgets')
  import('@builder.io/email')
}

function onReady(cb: Function) {
  if (document.readyState !== 'loading') {
    cb()
  } else {
    document.addEventListener('DOMContentLoaded', cb as any)
  }
}

if (Builder.isBrowser && !customElements.get('builder-component')) {
  const inject = () => {
    const selector = '.builder-component-wrap.builder-to-embed'
    const matches = document.querySelectorAll(selector)
    for (let i = 0; i < matches.length; i++) {
      const el = matches[i]
      const attrs = el.attributes
      const newEl = document.createElement('builder-component')
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i]
        if (attr.name.indexOf('data-') === 0) {
          const name = attr.name.indexOf('data-') === 0 ? attr.name.slice(5) : attr.name
          const value = attr.value
          // TODO: allow properties too
          newEl.setAttribute(name, value)
        }
      }
      el.classList.remove('builder-to-embed')
      // newEl.appendChild(el)
      el.appendChild(newEl)
    }
  }
  inject()

  onReady(inject)

  // TODO: test this out and add if/when needed
  // if (typeof MutationObserver !== 'undefined') {
  //   const observer = new MutationObserver(mutations => {
  //     inject()
  //   })
  //   observer.observe(document.body, {
  //     childList: true,
  //     subtree: true
  //   })
  // }

  // let getReactPromise: Promise<any> | null = null

  class BuilderComponentElement extends HTMLElement {
    private previousName = ''
    private subscriptions: Function[] = []
    // TODO: do this in core SDK
    private trackedClick = false
    data: any

    prerender = true

    private _options: GetContentOptions = {}

    get options() {
      return this._options
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
    }

    connectedCallback() {
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

      // Start the import
      // TODO: conditional widget loading / installing
      // getReactPromise = Promise.all([import('@builder.io/react'), import('@builder.io/widgets')])

      // TODO: import react, import (needed) widgets, fetch json,
      // then hydrate
      // Needs option for prerender=false if you use custom components
      // (in future builder will server render custom and monitor and charge)

      this.getOptionsFromAttribute()
      this.addEventListener('remove', () => this.unsubscribe())
      this.addEventListener('click', event => {
        if (builder.canTrack) {
          if (this.data) {
            builder.trackInteraction(
              this.data.id,
              this.data.testVariationId || this.data.id,
              this.trackedClick,
              event
            )
            if (!this.trackedClick) {
              this.trackedClick = true
            }
          }
        }
      })
      this.getContent()
    }

    attributeChangedCallback() {
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
      const existing = this.querySelector(`[data-builder-component="${name}"]`)
      if (existing) {
        const id = existing.getAttribute('data-builder-content-id')
        const variationId = existing.getAttribute('data-builder-variation-id')
        if (id && variationId) {
          return {
            id,
            testVariationId: variationId
          }
        }
      }
      return null
    }

    getContent() {
      const key = this.getAttribute('key') || this.getAttribute('api-key')
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
      if (name === this.previousName) {
        return false
      }

      const entry = this.getAttribute('entry')

      if (!this.prerender || !builder.apiKey) {
        this.loadReact(entry ? { id: entry } : null)
        return
      }

      this.unsubscribe()
      if (!name) {
        return false
      }

      const { currentContent } = this
      if (currentContent) {
        this.data = currentContent
        this.loaded()
        // Loaded from server
        // TODO: print the sdk version from server that rendered, fetch that and data, rerender and hydrate using
        // forced content and variation IDs
        // builder.trackImpression(
        //   currentContent.id,
        //   currentContent.testVariationId || currentContent.id
        // )
        this.loadReact(this.data)
        return
      }

      this.previousName = name
      this.classList.add('builder-loading')
      let unsubscribed = false
      // TODO: allow options as property or json
      const subscription = builder
        .get(name, {
          key: (!Builder.isEditing && (this.getAttribute('entry') || name!)) || undefined,
          entry: entry || undefined,
          // TODO
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
              if (builder.canTrack) {
                // TODO: track unique vs not as well
                // TODO: don't double track when react loads!
                // builder.trackImpression(data.id, data.testVariationId || data.id)
              }
              if (data.data && data.data.html) {
                // Where is the nested builder component going?
                this.innerHTML = data.data.html
                const loadEvent = new CustomEvent('htmlload', { detail: data })
                this.dispatchEvent(loadEvent)
                // if (data.data.animations && data.data.animations.length) {
                //   Builder.nextTick(() => {
                //     Builder.animator.bindAnimations(data.data.animations)
                //   })
                // }
              }

              // TODO: throttle this if in iframe instead of doing none
              // if (data.data && data.data.jsCode && !Builder.isIframe) {
              //   try {
              //     new Function(data.data.jsCode)(data)
              //   } catch (error) {
              //     console.warn('Eval error', error)
              //   }
              // }
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
            // console.warn('Builder webcomponent error:', error)
            // this.classList.add('builder-errored')
            // this.classList.add('builder-loaded')
            // this.classList.remove('builder-loading')
            // const errorEvent = new CustomEvent('error', { detail: error })
            // this.dispatchEvent(errorEvent)
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
        this.getAttribute('name') || this.getAttribute('model') || this.getAttribute('model-name')

      const getReactPromise = import('@builder.io/react') // TODO: only import what needed based on what comes back
      const getWidgetsPromise = import('@builder.io/widgets')

      let emailPromise: Promise<any> | null = null
      if (name === 'email') {
        emailPromise = import('@builder.io/email')
      }

      let unsubscribed = false

      if (!this.prerender || (Builder.isIframe && (!builder.apiKey || builder.apiKey === 'DEMO'))) {
        const { BuilderComponent } = await getReactPromise
        await getWidgetsPromise
        // Ensure styles don't load twice
        BuilderComponent.renderInto(this, {
          modelName: name!,
          emailMode:
            ((this.options as any) || {}).emailMode || this.getAttribute('email-mode') === 'true',
          options: {
            ...this.options
            // entry: data ? data.id : undefined,
            // initialContent: data ? [data] : undefined
            // TODO: specify variation?
          }
        })
        return
      }

      const subscription = builder
        .get(name!, {
          key: Builder.isEditing ? name! : this.getAttribute('entry') || name!,
          ...this.options,
          entry: data ? data.id : this.options.entry || undefined,
          prerender: false
        })
        .subscribe(
          async data => {
            if (unsubscribed) {
              console.log('unsubscribe didnt work!')
              return
            }
            // unsubscribed = true
            // subscription.unsubscribe()

            const { BuilderComponent } = await getReactPromise
            await getWidgetsPromise
            if (emailPromise) {
              await emailPromise
            }

            const loadEvent = new CustomEvent('load', { detail: data })
            this.dispatchEvent(loadEvent)

            // await getReactPromise

            // TODO Promise.all(['@builder.io/react', '@builder.io/widgets']);
            // Install widgets on server

            // const { BuilderComponent, builder: reactBuilder } = await import('@builder.io/react')

            // if (reactBuilder !== builder) {
            //   console.warn('builder loaded twice!')
            //   reactBuilder.apiKey = builder.apiKey
            // }

            // TODO: await getting all dynamic js from returned data

            // TODO: prerender: false option
            // console.log('renderInto', this.options, data)
            BuilderComponent.renderInto(this, {
              modelName: name!,
              emailMode:
                ((this.options as any) || {}).emailMode ||
                this.getAttribute('email-mode') === 'true',
              options: {
                ...this.options,
                entry: data ? data.id : undefined,
                initialContent: data ? [data] : undefined,
                key: Builder.isEditing ? name! : undefined
                // TODO: specify variation?
              }
            })

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
              const { BuilderComponent } = await getReactPromise
              await getWidgetsPromise
              if (emailPromise) {
                await emailPromise
              }
              BuilderComponent.renderInto(this, {
                modelName: name!,
                emailMode:
                  ((this.options as any) || {}).emailMode ||
                  this.getAttribute('email-mode') === 'true',
                options: {
                  ...this.options,
                  entry: data ? data.id : undefined,
                  initialContent: data ? [data] : undefined,
                  key: Builder.isEditing ? name! : undefined
                  // TODO: specify variation?
                }
              })
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

      // import('./lazy-test').then(result => {
      //   console.log('lazy test loaded', result.foo)
      // })
    }

    unsubscribe() {
      if (this.subscriptions) {
        this.subscriptions.forEach(fn => fn())
        this.subscriptions = []
      }
    }
  }
  customElements.define('builder-component', BuilderComponentElement)
  class BuilderSimpleComponentElement extends HTMLElement {
    private previousName = ''
    private subscriptions: Function[] = []
    // TODO: do this in core SDK
    private trackedClick = false
    data: any

    private _options: GetContentOptions = {}

    get options() {
      return this._options
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
    }

    connectedCallback() {
      this.getOptionsFromAttribute()
      this.addEventListener('remove', () => this.unsubscribe())
      this.addEventListener('click', event => {
        if (builder.canTrack) {
          if (this.data) {
            builder.trackInteraction(
              this.data.id,
              this.data.testVariationId || this.data.id,
              this.trackedClick,
              event
            )
            if (!this.trackedClick) {
              this.trackedClick = true
            }
          }
        }
      })
      this.getContent()
    }

    attributeChangedCallback() {
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
      const existing = this.querySelector(`[data-builder-component="${name}"]`)
      if (existing) {
        const id = existing.getAttribute('data-builder-content-id')
        const variationId = existing.getAttribute('data-builder-variation-id')
        if (id && variationId) {
          return {
            id,
            testVariationId: variationId
          }
        }
      }
      return null
    }

    getContent() {
      const key = this.getAttribute('key') || this.getAttribute('api-key')
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
      }

      const name = this.getAttribute('name') || this.getAttribute('model')
      if (name === this.previousName) {
        return false
      }

      const entry = this.getAttribute('entry')

      this.unsubscribe()
      if (!name) {
        return false
      }

      const { currentContent } = this
      if (currentContent) {
        this.data = currentContent
        this.loaded()
        // Loaded from server
        // TODO: print the sdk version from server that rendered, fetch that and data, rerender and hydrate using
        // forced content and variation IDs
        builder.trackImpression(
          currentContent.id,
          currentContent.testVariationId || currentContent.id
        )
        return
      }

      this.previousName = name
      this.classList.add('builder-loading')
      // TODO: allow options as property or json
      const subscription = builder
        .get(name, {
          // TODO: if Builder.isEditing all keys become models, OR when editing models
          // post up all of they keys and then post info with a key for the first editing model...
          key: (!Builder.isEditing && (this.getAttribute('entry') || name!)) || undefined,
          entry: entry || undefined,
          ...this.options,
          prerender: true
        })
        .subscribe(
          (data: any) => {
            this.classList.remove('builder-loading')
            this.loaded()
            if (!data) {
              // TODO: pass flags from dashboard if should load react (dynamic components used) and if needs
              // to lazy load any components. if so fetch react, if not keep just html
              this.classList.add('builder-no-content-found')
              const loadEvent = new CustomEvent('load', { detail: data })
              this.dispatchEvent(loadEvent)
              return
            }
            if (this.classList.contains('builder-editor-injected')) {
              this.unsubscribe()
            } else {
              this.data = data
              if (builder.canTrack) {
                // TODO: track unique vs not as well
                builder.trackImpression(data.id, data.testVariationId || data.id)
              }
              if (data.data && data.data.html) {
                this.innerHTML = data.data.html
                const scripts = this.getElementsByTagName('script')
                for (let i = 0; i < scripts.length; i++) {
                  const script = scripts[i]
                  // Innertext?
                  try {
                    new Function(script.innerText)(data)
                  } catch (error) {
                    console.warn('Eval error', error)
                  }
                }

                const loadEvent = new CustomEvent('load', { detail: data })
                this.dispatchEvent(loadEvent)
                if (data.data.animations && data.data.animations.length) {
                  Builder.nextTick(() => {
                    Builder.animator.bindAnimations(data.data.animations)
                  })
                }
              }

              // TODO: throttle this if in iframe instead of doing none
              if (data.data && data.data.jsCode && !Builder.isIframe) {
                try {
                  new Function(data.data.jsCode)(data)
                } catch (error) {
                  console.warn('Eval error', error)
                }
              }
            }
          },
          (error: any) => {
            console.warn('Builder webcomponent error:', error)
            this.classList.add('builder-errored')
            this.classList.add('builder-loaded')
            this.classList.remove('builder-loading')
            const errorEvent = new CustomEvent('error', { detail: error })
            this.dispatchEvent(errorEvent)
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
  customElements.define('builder-simple-component', BuilderSimpleComponentElement)
  // <builder-canvas ?

  // TODO: "canTrack"
  class BuilderInit extends HTMLElement {
    init() {
      const key = this.getAttribute('apiKey') || this.getAttribute('key')
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
