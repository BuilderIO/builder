/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component';
import { BuilderElement, Builder } from '@builder.io/sdk';
import { BuilderMetaContext } from '../store/builder-meta';
import { withBuilder } from '../functions/with-builder';
import { throttle } from '../functions/throttle';

// Taken from (and modified) the shopify theme script repo
// https://github.com/Shopify/theme-scripts/blob/bcfb471f2a57d439e2f964a1bb65b67708cc90c3/packages/theme-images/images.js#L59
function removeProtocol(path: string) {
  return path.replace(/http(s)?:/, '');
}

function isElementInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getShopifyImageUrl(src: string, size: string): string | null {
  if (!src || !src?.match(/cdn\.shopify\.com/) || !size) {
    return src;
  }

  if (size === 'master') {
    return removeProtocol(src);
  }

  const match = src.match(/(_\d+x(\d+)?)?(\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?)/i);

  if (match) {
    const prefix = src.split(match[0]);
    const suffix = match[3];
    const useSize = size.match('x') ? size : `${size}x`;

    return removeProtocol(`${prefix[0]}_${useSize}${suffix}`);
  }

  return null;
}

const DEFAULT_ASPECT_RATIO = 0.7041;

export function updateQueryParam(uri = '', key: string, value: string | number | boolean): string {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
  }

  return uri + separator + key + '=' + encodeURIComponent(value);
}

export function getSrcSet(url: string): string {
  if (!url) {
    return url;
  }

  const sizes = [100, 200, 400, 800, 1200, 1600, 2000];

  if (url.match(/builder\.io/)) {
    let srcUrl = url;
    const widthInSrc = Number(url.split('?width=')[1]);
    if (!isNaN(widthInSrc)) {
      srcUrl = `${srcUrl} ${widthInSrc}w`;
    }

    return sizes
      .filter(size => size !== widthInSrc)
      .map(size => `${updateQueryParam(url, 'width', size)} ${size}w`)
      .concat([srcUrl])
      .join(', ');
  }

  if (url.match(/cdn\.shopify\.com/)) {
    return sizes
      .map(size => [getShopifyImageUrl(url, `${size}x${size}`), size])
      .filter(([sizeUrl]) => !!sizeUrl)
      .map(([sizeUrl, size]) => `${sizeUrl} ${size}w`)
      .concat([url])
      .join(', ');
  }

  return url;
}

export const getSizes = (sizes: string, block: BuilderElement) => {
  let useSizes = '';

  if (sizes) {
    const splitSizes = sizes.split(',');
    const sizesLength = splitSizes.length;
    useSizes = splitSizes
      .map((size: string, index) => {
        if (sizesLength === index + 1) {
          // If it is the last size in the array, then we want to strip out
          // any media query information. According to the img spec, the last
          // value for sizes cannot have a media query. If there is a media
          // query at the end it breaks AMP mode rendering
          // https://github.com/ampproject/amphtml/blob/b6313e372fdd1298928e2417dcc616b03288e051/src/size-list.js#L169
          return size.replace(/\([\s\S]*?\)/g, '').trim();
        } else {
          return size;
        }
      })
      .join(', ');
  } else if (block && block.responsiveStyles) {
    const generatedSizes = [];
    let hasSmallOrMediumSize = false;
    const unitRegex = /^\d+/;

    if (block.responsiveStyles?.small?.width?.match(unitRegex)) {
      hasSmallOrMediumSize = true;
      const mediaQuery = '(max-width: 639px)';
      const widthAndQuery = `${mediaQuery} ${block.responsiveStyles.small.width.replace(
        '%',
        'vw'
      )}`;
      generatedSizes.push(widthAndQuery);
    }

    if (block.responsiveStyles?.medium?.width?.match(unitRegex)) {
      hasSmallOrMediumSize = true;
      const mediaQuery = '(max-width: 999px)';
      const widthAndQuery = `${mediaQuery} ${block.responsiveStyles.medium.width.replace(
        '%',
        'vw'
      )}`;
      generatedSizes.push(widthAndQuery);
    }

    if (block.responsiveStyles?.large?.width) {
      const width = block.responsiveStyles.large.width.replace('%', 'vw');
      generatedSizes.push(width);
    } else if (hasSmallOrMediumSize) {
      generatedSizes.push('100vw');
    }

    if (generatedSizes.length) {
      useSizes = generatedSizes.join(', ');
    }
  }

  return useSizes;
};

// TODO: use picture tag to support more formats
class ImageComponent extends React.Component<any, { imageLoaded: boolean; load: boolean }> {
  get useLazyLoading() {
    // Use builder.getLocation()
    return Builder.isBrowser && location.search.includes('builder.lazyLoadImages=false')
      ? false
      : Builder.isBrowser && location.href.includes('builder.lazyLoadImages=true')
      ? true
      : this.props.lazy;
  }

  // TODO: setting to always fade in the images (?)
  state = {
    imageLoaded: !this.useLazyLoading,
    load: !this.useLazyLoading,
  };

  pictureRef: HTMLPictureElement | null = null;

  scrollListener: null | ((e: Event) => void) = null;
  intersectionObserver: IntersectionObserver | null = null;

  componentWillUnmount() {
    if (Builder.isBrowser) {
      if (this.scrollListener) {
        window.removeEventListener('scroll', this.scrollListener);
        this.scrollListener = null;
      }

      if (this.intersectionObserver && this.pictureRef) {
        this.intersectionObserver.unobserve(this.pictureRef);
      }
    }
  }

  componentDidMount() {
    if (this.props.lazy && Builder.isBrowser) {
      if (this.pictureRef && isElementInViewport(this.pictureRef)) {
        this.setState({
          load: true,
        });
      } else if (typeof IntersectionObserver === 'function' && this.pictureRef) {
        const observer = (this.intersectionObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              // In view
              if (entry.intersectionRatio > 0) {
                this.setState({
                  load: true,
                });
                if (this.pictureRef) {
                  observer.unobserve(this.pictureRef);
                }
              }
            });
          }
        ));

        observer.observe(this.pictureRef);
      } else {
        // throttled scroll capture listener
        const listener = throttle(
          (event: Event) => {
            if (this.pictureRef) {
              const rect = this.pictureRef.getBoundingClientRect();
              const buffer = window.innerHeight / 2;
              if (rect.top < window.innerHeight + buffer) {
                this.setState({
                  ...this.state,
                  load: true,
                });
                window.removeEventListener('scroll', listener);
                this.scrollListener = null;
              }
            }
          },
          400,
          {
            leading: false,
            trailing: true,
          }
        );
        this.scrollListener = listener;

        window.addEventListener('scroll', listener, {
          capture: true,
          passive: true,
        });
        listener();
      }
    }
  }

  // Allow our legacy `image` prop, as well as allow a `src` prop for more intuitive
  // DX of manual usage (<Image src="..." />)
  get image() {
    return this.props.image || this.props.src;
  }

  getSrcSet(): string | undefined {
    const url = this.image;
    if (!url) {
      return;
    }

    // We can auto add srcset for cdn.builder.io and shopify
    // images, otherwise you can supply this prop manually
    if (!(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))) {
      return;
    }

    return getSrcSet(url);
  }

  render() {
    const { aspectRatio, lazy } = this.props;
    const children = this.props.builderBlock && this.props.builderBlock.children;

    let srcset = this.props.srcset;
    const sizes = getSizes(this.props.sizes, this.props.builderBlock);
    const image = this.image;

    if (srcset && image && image.includes('builder.io/api/v1/image')) {
      if (!srcset.includes(image.split('?')[0])) {
        console.debug('Removed given srcset');
        srcset = this.getSrcSet();
      }
    } else if (image && !srcset) {
      srcset = this.getSrcSet();
    }

    const isPixel = this.props.builderBlock?.id.startsWith('builder-pixel-');
    const { fitContent } = this.props;

    return (
      <BuilderMetaContext.Consumer>
        {value => {
          const amp = value.ampMode;
          const Tag: 'img' = amp ? ('amp-img' as any) : 'img';

          const imageContents = (!lazy || this.state.load || amp) && (
            <Tag
              {...(amp
                ? ({
                    layout: 'responsive',
                    height:
                      this.props.height ||
                      (aspectRatio ? Math.round(aspectRatio * 1000) : undefined),
                    width:
                      this.props.width ||
                      (aspectRatio ? Math.round(1000 / aspectRatio) : undefined),
                  } as any)
                : null)}
              alt={this.props.altText}
              key={
                Builder.isEditing
                  ? (typeof this.image === 'string' && this.image.split('?')[0]) || undefined
                  : undefined
              }
              role={!this.props.altText ? 'presentation' : undefined}
              css={{
                opacity: amp ? 1 : this.useLazyLoading && !this.state.imageLoaded ? 0 : 1,
                transition: 'opacity 0.2s ease-in-out',
                objectFit: this.props.backgroundSize || 'cover',
                objectPosition: this.props.backgroundPosition || 'center',
                ...(aspectRatio &&
                  !amp && {
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    left: 0,
                    top: 0,
                  }),
                ...(amp && {
                  ['& img']: {
                    objectFit: this.props.backgroundSize,
                    objectPosition: this.props.backgroundPosition,
                  },
                }),
              }}
              loading={isPixel ? 'eager' : 'lazy'}
              className={'builder-image' + (this.props.className ? ' ' + this.props.className : '')}
              src={this.image}
              {...(!amp && {
                // TODO: queue these so react renders all loads at once
                onLoad: () => this.setState({ imageLoaded: true }),
              })}
              // TODO: memoize on image on client
              srcSet={srcset}
              sizes={!amp && sizes ? sizes : undefined}
            />
          );

          return (
            <React.Fragment>
              {amp ? (
                imageContents
              ) : (
                <picture ref={ref => (this.pictureRef = ref)}>
                  {srcset && srcset.match(/builder\.io/) && !this.props.noWebp && (
                    <source srcSet={srcset.replace(/\?/g, '?format=webp&')} type="image/webp" />
                  )}
                  {imageContents}
                </picture>
              )}
              {aspectRatio && !amp && !(fitContent && children && children.length) ? (
                <div
                  className="builder-image-sizer"
                  css={{
                    width: '100%',
                    paddingTop: aspectRatio * 100 + '%',
                    pointerEvents: 'none',
                    fontSize: 0,
                  }}
                >
                  {' '}
                </div>
              ) : null}
              {children && children.length ? (
                fitContent ? (
                  children.map((block: BuilderElement, index: number) => (
                    <BuilderBlockComponent key={block.id} block={block} />
                  ))
                ) : (
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
                      height: '100%',
                    }}
                  >
                    {children.map((block: BuilderElement, index: number) => (
                      <BuilderBlockComponent key={block.id} block={block} />
                    ))}
                  </div>
                )
              ) : null}
            </React.Fragment>
          );
        }}
      </BuilderMetaContext.Consumer>
    );
  }
}

export const Image = withBuilder(ImageComponent, {
  name: 'Image',
  static: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  defaultStyles: {
    position: 'relative',
    minHeight: '20px',
    minWidth: '20px',
    overflow: 'hidden',
  },
  canHaveChildren: true,
  inputs: [
    {
      // TODO: new editor type 'responsiveImage' that can do different crops per breakpoint
      // and sets an object and that is read here
      name: 'image',
      type: 'file',
      bubble: true,
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
      onChange: (options: Map<string, any>) => {
        const DEFAULT_ASPECT_RATIO = 0.7041;
        options.delete('srcset');
        options.delete('noWebp');
        function loadImage(url: string, timeout = 60000): Promise<HTMLImageElement> {
          return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            let loaded = false;
            img.onload = () => {
              loaded = true;
              resolve(img);
            };

            img.addEventListener('error', event => {
              console.warn('Image load failed', event.error);
              reject(event.error);
            });

            img.src = url;
            setTimeout(() => {
              if (!loaded) {
                reject(new Error('Image load timed out'));
              }
            }, timeout);
          });
        }

        function round(num: number) {
          return Math.round(num * 1000) / 1000;
        }

        const value = options.get('image');
        const aspectRatio = options.get('aspectRatio');

        // For SVG images - don't render as webp, keep them as SVG
        fetch(value)
          .then(res => res.blob())
          .then(blob => {
            if (blob.type.includes('svg')) {
              options.set('noWebp', true);
            }
          });

        if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
          return loadImage(value).then(img => {
            const possiblyUpdatedAspectRatio = options.get('aspectRatio');
            if (
              options.get('image') === value &&
              (!possiblyUpdatedAspectRatio || possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)
            ) {
              if (img.width && img.height) {
                options.set('aspectRatio', round(img.height / img.width));
                options.set('height', img.height);
                options.set('width', img.width);
              }
            }
          });
        }
      },
    },
    {
      name: 'backgroundSize',
      type: 'text',
      defaultValue: 'cover',
      enum: [
        {
          label: 'contain',
          value: 'contain',
          helperText: 'The image should never get cropped',
        },
        {
          label: 'cover',
          value: 'cover',
          helperText: `The image should fill its box, cropping when needed`,
        },
        // TODO: add these options back
        // { label: 'auto', value: 'auto', helperText: '' },
        // { label: 'fill', value: 'fill', helperText: 'The image should fill the box, being stretched or squished if necessary' },
      ] as any,
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
        'bottom right',
      ],
    },
    {
      name: 'altText',
      type: 'string',
      helperText: 'Text to display when the user has images off',
    },
    {
      name: 'height',
      type: 'number',
      hideFromUI: true,
    },
    {
      name: 'width',
      type: 'number',
      hideFromUI: true,
    },
    {
      name: 'sizes',
      type: 'string',
      hideFromUI: true,
    },
    {
      name: 'srcset',
      type: 'string',
      hideFromUI: true,
    },
    // TODO: force lazy load option (maybe via binding for now hm component.options.lazy: true)
    {
      name: 'lazy',
      type: 'boolean',
      defaultValue: true,
      hideFromUI: true,
    },
    {
      name: 'fitContent',
      type: 'boolean',
      helperText:
        "When child blocks are provided, fit to them instead of using the image's aspect ratio",
      defaultValue: true,
    },
    {
      name: 'aspectRatio',
      type: 'number',
      helperText:
        "This is the ratio of height/width, e.g. set to 1.5 for a 300px wide and 200px tall photo. Set to 0 to not force the image to maintain it's aspect ratio",
      advanced: true,
      defaultValue: DEFAULT_ASPECT_RATIO,
    },
    // {
    //   name: 'backgroundRepeat',
    //   type: 'text',
    //   defaultValue: 'no-repeat',
    //   enum: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
    // },
  ],
});
