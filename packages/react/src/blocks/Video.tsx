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
  fitContent?: boolean;
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
    const video = this.video;
    if (video) {
      // There are some issues with boolean attributes and media elements
      // see: https://github.com/facebook/react/issues/10389
      const boolProps: Array<'muted' | 'playsInline' | 'autoPlay'> = [
        'muted',
        'playsInline',
        'autoPlay',
      ];
      boolProps.forEach(prop => {
        const attr = prop.toLowerCase();
        if (this.props[prop]) {
          video.setAttribute(attr, attr);
        } else {
          video.removeAttribute(attr);
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
            zIndex: 2,
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
        {aspectRatio && !(this.props.fitContent && children) ? (
          <div
            css={{
              width: '100%',
              paddingTop: aspectRatio * 100 + '%',
              pointerEvents: 'none',
              fontSize: 0,
            }}
          />
        ) : null}
        {children && this.props.fitContent ? (
          <div css={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {children}
          </div>
        ) : children ? (
          <div
            css={{
              pointerEvents: 'none',
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
        ) : null}
      </div>
    );
  }
}

export const Video = Builder.registerComponent(withChildren(VideoComponent), {
  name: 'Video',
  canHaveChildren: true,
  defaultStyles: {
    minHeight: '20px',
    minWidth: '20px',
  },
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-videocam-24px%20(1).svg?alt=media&token=49a84e4a-b20e-4977-a650-047f986874bb',
  inputs: [
    {
      name: 'video',
      type: 'file',
      allowedFileTypes: ['mp4'],
      bubble: true,
      defaultValue:
        'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/assets%2FKQlEmWDxA0coC3PK6UvkrjwkIGI2%2F28cb070609f546cdbe5efa20e931aa4b?alt=media&token=912e9551-7a7c-4dfb-86b6-3da1537d1a7f',
      required: true,
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
      name: 'fitContent',
      type: 'boolean',
      helperText: 'When child blocks are provided, fit to them instead of using the aspect ratio',
      defaultValue: true,
      advanced: true,
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
