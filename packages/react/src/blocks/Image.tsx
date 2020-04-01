/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'

import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component'
import { BuilderElement, Builder } from '@builder.io/sdk'
import { BuilderMetaContext } from '../store/builder-meta'
import { withBuilder } from '../functions/with-builder'
import { throttle } from '../functions/throttle'

const DEFAULT_ASPECT_RATIO = 0.7041

export function updateQueryParam(uri = '', key: string, value: string) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2')
  }

  return uri + separator + key + '=' + encodeURIComponent(value)
}

export const getSrcSet = (url: string) => {
  if (!url) {
    return url
  }

  if (!url.match(/builder\.io/)) {
    return url
  }
  let srcUrl = url
  const widthInSrc = Number(url.split('?width=')[1])
  if (!isNaN(widthInSrc)) {
    srcUrl = `${srcUrl} ${widthInSrc}w`
  }
  const sizes = [100, 200, 400, 800, 1200, 1600, 2000]
  return sizes
    .filter(size => size !== widthInSrc)
    .map(size => `${updateQueryParam(url, 'width', String(size))} ${size}w`)
    .concat([srcUrl])
    .join(', ')
}

// TODO: use picture tag to support more formats
class ImageComponent extends React.Component<any> {
  get useLazyLoading() {
    // Use builder.getLocation()
    return Builder.isBrowser &&
      location.search.includes('builder.lazyLoadImages=false')
      ? false
      : Builder.isBrowser &&
        location.href.includes('builder.lazyLoadImages=true')
      ? true
      : this.props.lazy
  }

  // TODO: setting to always fade in the images (?)
  state = {
    imageLoaded: !this.useLazyLoading,
    load: !this.useLazyLoading
  }

  pictureRef: HTMLPictureElement | null = null

  componentDidMount() {
    if (this.props.lazy && Builder.isBrowser) {
      // throttled scroll capture listener
      const listener = throttle(
        (event: Event) => {
          if (this.pictureRef) {
            const rect = this.pictureRef.getBoundingClientRect()
            const buffer = window.innerHeight / 2
            if (rect.top < window.innerHeight + buffer) {
              this.setState({
                ...this.state,
                load: true
              })
              window.removeEventListener('scroll', listener)
            }
          }
        },
        400,
        {
          leading: false,
          trailing: true
        }
      )

      window.addEventListener('scroll', listener, {
        capture: true,
        passive: true
      })
      listener()
    }
  }

  getSrcSet() {
    const url = this.props.image
    if (!url) {
      return undefined
    }

    // We can auto add srcset for cdn.builder.io images, otherwise you can supply
    // this prop manually
    if (!url.match(/builder\.io/)) {
      return undefined
    }

    return getSrcSet(url)
  }

  render() {
    const { aspectRatio, lazy } = this.props
    const children = this.props.builderBlock && this.props.builderBlock.children

    let srcset = this.props.srcset
    const image = this.props.image

    if (srcset && image && image.includes('builder.io/api/v1/image')) {
      if (!srcset.includes(image.split('?')[0])) {
        console.debug('Removed given srcset')
        srcset = this.getSrcSet()
      }
    } else if (image && !srcset) {
      srcset = this.getSrcSet()
    }

    return (
      <BuilderMetaContext.Consumer>
        {value => {
          const amp = value.ampMode
          const Tag: 'img' = amp ? ('amp-img' as any) : 'img'

          const imageContents = (!lazy || this.state.load) && (
            <Tag
              {...(amp
                ? ({
                    layout: 'responsive',
                    height:
                      this.props.height ||
                      (aspectRatio
                        ? Math.round(aspectRatio * 1000)
                        : undefined),
                    width:
                      this.props.width ||
                      (aspectRatio ? Math.round(1000 / aspectRatio) : undefined)
                  } as any)
                : null)}
              alt={this.props.altText}
              key={
                Builder.isEditing
                  ? (typeof this.props.image === 'string' &&
                      this.props.image.split('?')[0]) ||
                    undefined
                  : undefined
              }
              role={!this.props.altText ? 'presentation' : undefined}
              css={{
                opacity: amp
                  ? 1
                  : this.useLazyLoading && !this.state.imageLoaded
                  ? 0
                  : 1,
                transition: 'opacity 0.2s ease-in-out',
                objectFit: this.props.backgroundSize || 'cover',
                objectPosition: this.props.backgroundPosition || 'center',
                ...(aspectRatio && {
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  left: 0,
                  top: 0
                }),
                ...(amp && {
                  ['& img']: {
                    objectFit: this.props.backgroundSize,
                    objectPosition: this.props.backgroundPosition
                  }
                })
              }}
              className={
                'builder-image' +
                (this.props.className ? ' ' + this.props.className : '')
              }
              src={this.props.image}
              {...(!amp && {
                // TODO: queue these so react renders all loads at once
                onLoad: () => this.setState({ imageLoaded: true })
              })}
              // TODO: memoize on image on client
              srcSet={srcset}
              sizes={this.props.sizes}
            />
          )

          return (
            <React.Fragment>
              {amp ? (
                imageContents
              ) : (
                <picture ref={ref => (this.pictureRef = ref)}>
                  {srcset && srcset.match(/builder\.io/) && (
                    <source
                      srcSet={srcset.replace(/\?/g, '?format=webp&')}
                      type="image/webp"
                    />
                  )}
                  {imageContents}
                </picture>
              )}
              {aspectRatio ? (
                <div
                  className="builder-image-sizer"
                  css={{
                    width: '100%',
                    paddingTop: aspectRatio * 100 + '%',
                    pointerEvents: 'none',
                    fontSize: 0
                  }}
                >
                  {' '}
                </div>
              ) : null}
              {children && children.length ? (
                // TODO: if no aspect ratio and has children, don't make this absolute but instead
                // make the image absolute and fit the children (or with a special option)
                <div
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                >
                  {children.map((block: BuilderElement, index: number) => (
                    <BuilderBlockComponent key={block.id} block={block} />
                  ))}
                </div>
              ) : null}
            </React.Fragment>
          )
        }}
      </BuilderMetaContext.Consumer>
    )
  }
}

export const Image = withBuilder(ImageComponent, {
  name: 'Image',
  static: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  defaultStyles: {
    minHeight: '20px',
    minWidth: '20px',
    overflow: 'hidden'
  },
  canHaveChildren: true,
  inputs: [
    {
      // TODO: new editor type 'responsiveImage' that can do different crops per breakpoint
      // and sets an object and that is read here
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
      onChange: (options: Map<string, any>) => {
        const DEFAULT_ASPECT_RATIO = 0.7041
        options.delete('srcset')
        function loadImage(
          url: string,
          timeout = 60000
        ): Promise<HTMLImageElement> {
          return new Promise((resolve, reject) => {
            const img = document.createElement('img')
            let loaded = false
            img.onload = () => {
              loaded = true
              resolve(img)
            }

            img.addEventListener('error', event => {
              console.warn('Image load failed', event.error)
              reject(event.error)
            })

            img.src = url
            setTimeout(() => {
              if (!loaded) {
                reject(new Error('Image load timed out'))
              }
            }, timeout)
          })
        }

        function round(num: number) {
          return Math.round(num * 1000) / 1000
        }

        // // TODO
        const value = options.get('image')
        const aspectRatio = options.get('aspectRatio')
        if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
          return loadImage(value).then(img => {
            const possiblyUpdatedAspectRatio = options.get('aspectRatio')
            if (
              options.get('image') === value &&
              (!possiblyUpdatedAspectRatio ||
                possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)
            ) {
              if (img.width && img.height) {
                options.set('aspectRatio', round(img.height / img.width))
                options.set('height', img.height)
                options.set('width', img.width)
              }
            }
          })
        }
      }
    },
    {
      name: 'backgroundSize',
      type: 'text',
      defaultValue: 'cover',
      enum: [
        {
          label: 'contain',
          value: 'contain',
          helperText: 'The image should never get cropped'
        },
        {
          label: 'cover',
          value: 'cover',
          helperText: `The image should fill it's box, cropping when needed`
        }
        // TODO: add these options back
        // { label: 'auto', value: 'auto', helperText: '' },
        // { label: 'fill', value: 'fill', helperText: 'The image should fill the box, being stretched or squished if necessary' },
      ] as any
    },
    {
      name: 'backgroundPosition',
      type: 'text',
      defaultValue: 'center',
      enum: [
        'center',
        'top',
        'left',
        'right',
        'bottom',
        'top left',
        'top right',
        'bottom left',
        'bottom right'
      ]
    },
    {
      name: 'altText',
      type: 'string',
      helperText: 'Text to display when the user has images off'
    },
    {
      name: 'height',
      type: 'number',
      hideFromUI: true
    },
    {
      name: 'width',
      type: 'number',
      hideFromUI: true
    },
    {
      name: 'sizes',
      type: 'string',
      hideFromUI: true
    },
    {
      name: 'srcset',
      type: 'string',
      hideFromUI: true
    },
    // TODO: force lazy load option (maybe via binding for now hm component.options.lazy: true)
    {
      name: 'lazy',
      type: 'boolean',
      hideFromUI: true
    },
    {
      name: 'aspectRatio',
      type: 'number',
      helperText:
        "This is the ratio of height/width, e.g. set to 1.5 for a 300px wide and 200px tall photo. Set to 0 to not force the image to maintain it's aspect ratio",
      advanced: true,
      defaultValue: DEFAULT_ASPECT_RATIO
    }
    // {
    //   name: 'backgroundRepeat',
    //   type: 'text',
    //   defaultValue: 'no-repeat',
    //   enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
    // },
  ]
})
