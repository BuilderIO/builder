/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';

import { throttle } from '../functions/throttle';
import { withChildren } from '../functions/with-children';
import { Builder } from '@builder.io/sdk';

const DEFAULT_ASPECT_RATIO = 0.7004048582995948;

class VideoComponent extends React.Component<{
  video: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  aspectRatio?: number;
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill';
  position?: string;
  posterImage?: string;
  lazyLoad?: boolean;
}> {
  video: HTMLVideoElement | null = null;
  containerRef: HTMLElement | null = null;

  scrollListener: null | ((e: Event) => void) = null;

  get lazyLoad() {
    // Default is true, must be explicitly turned off to not have this behavior
    // as it's highly recommended for performance and bandwidth optimization
    return this.props.lazyLoad !== false;
  }

  state = {
    load: !this.lazyLoad,
  };

  updateVideo() {
    if (this.video) {
      const attributes: Array<'muted' | 'playsInline' | 'autoPlay'> = [
        'muted',
        'playsInline',
        'autoPlay',
      ];
      attributes.forEach(attr => {
        if (this.props[attr]) {
          this.video?.setAttribute(attr.toLowerCase(), 'true');
        } else {
          this.video?.removeAttribute(attr.toLowerCase());
        }
      });
    }
  }

  componentDidUpdate() {
    this.updateVideo();
  }

  componentDidMount() {
    this.updateVideo();

    if (this.lazyLoad && Builder.isBrowser) {
      // TODO: have a way to consolidate all listeners into one timer
      // to avoid excessive reflows
      const listener = throttle(
        (event: Event) => {
          if (this.containerRef) {
            const rect = this.containerRef.getBoundingClientRect();
            const buffer = window.innerHeight / 2;
            if (rect.top < window.innerHeight + buffer) {
              this.setState(state => ({
                ...state,
                load: true,
              }));
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

  componentWillUnmount() {
    if (Builder.isBrowser && this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }

  render() {
    const { aspectRatio, children } = this.props;
    return (
      <div ref={ref => (this.containerRef = ref)} css={{ position: 'relative' }}>
        {/* TODO: option to load the whole thing (inc. poster image) or just video */}
        <video
          key={this.props.video || 'no-src'}
          poster={this.props.posterImage}
          ref={ref => (this.video = ref)}
          autoPlay={this.props.autoPlay}
          muted={this.props.muted}
          controls={this.props.controls}
          loop={this.props.loop}
          className="builder-video"
          css={{
            width: '100%',
            height: '100%',
            objectFit: this.props.fit,
            objectPosition: this.props.position,
            // Hack to get object fit to work as expected and not have the video
            // overflow
            borderRadius: 1,
            ...(aspectRatio
              ? {
                  position: 'absolute',
                }
              : null),
          }}
        >
          {(!this.lazyLoad || this.state.load) && (
            <source type="video/mp4" src={this.props.video} />
          )}
        </video>
        {aspectRatio ? (
          <div
            css={{
              width: '100%',
              paddingTop: aspectRatio * 100 + '%',
              pointerEvents: 'none',
              fontSize: 0,
            }}
          />
        ) : null}
        {children && (
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
            {children}
          </div>
        )}
      </div>
    );
  }
}

export const Video = Builder.registerComponent(withChildren(VideoComponent), {
  name: 'Video',
  canHaveChildren: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-videocam-24px%20(1).svg?alt=media&token=49a84e4a-b20e-4977-a650-047f986874bb',
  inputs: [
    {
      name: 'video',
      type: 'file',
      allowedFileTypes: ['mp4'],
      defaultValue:
        'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2F28cb070609f546cdbe5efa20e931aa4b?alt=media&token=912e9551-7a7c-4dfb-86b6-3da1537d1a7f',
      required: true,
      onChange: (options: Map<string, any>) => {
        const DEFAULT_ASPECT_RATIO = 0.7004048582995948;
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

        // // TODO
        const value = options.get('image');
        const aspectRatio = options.get('aspectRatio');
        if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
          return loadImage(value).then(img => {
            const possiblyUpdatedAspectRatio = options.get('aspectRatio');
            if (
              options.get('image') === value &&
              (!possiblyUpdatedAspectRatio || possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)
            ) {
              if (img.width && img.height) {
                options.set('aspectRatio', round(img.height / img.width));
              }
            }
          });
        }
      },
    },
    {
      name: 'posterImage',
      type: 'file',
      allowedFileTypes: ['jpeg', 'png'],
      helperText: 'Image to show before the video plays',
    },
    {
      name: 'autoPlay',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'controls',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'muted',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'loop',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'playsInline',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'fit',
      type: 'text',
      defaultValue: 'cover',
      enum: ['contain', 'cover', 'fill', 'auto'],
    },
    {
      name: 'position',
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
      name: 'height',
      type: 'number',
      advanced: true,
    },
    {
      name: 'width',
      type: 'number',
      advanced: true,
    },
    {
      name: 'aspectRatio',
      type: 'number',
      advanced: true,
      defaultValue: DEFAULT_ASPECT_RATIO,
    },
    {
      name: 'lazyLoad',
      type: 'boolean',
      helperText:
        'Load this video "lazily" - as in only when a user scrolls near the video. Recommended for optmized performance and bandwidth consumption',
      defaultValue: true,
      advanced: true,
    },
  ],
});
