import React from 'react';
import ReactNativeVideo from 'react-native-video';

import { BuilderBlock } from '../decorators/builder-block.decorator';
import { View } from 'react-native';

const DEFAULT_ASPECT_RATIO = 0.7004048582995948;

@BuilderBlock({
  name: 'Video',
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
      hideFromUI: true,
    },
    {
      name: 'width',
      type: 'number',
      hideFromUI: true,
    },
    {
      name: 'aspectRatio',
      type: 'number',
      hideFromUI: true,
      defaultValue: DEFAULT_ASPECT_RATIO,
    },
  ],
})
export class Video extends React.Component<{
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
}> {
  video: ReactNativeVideo | null = null;

  componentDidMount() {}

  render() {
    const { aspectRatio } = this.props;
    return (
      <View style={{ position: 'relative' }}>
        <ReactNativeVideo
          paused={!this.props.autoPlay}
          key={this.props.video || 'no-src'}
          poster={this.props.posterImage}
          source={{ uri: this.props.video }}
          muted={this.props.muted}
          controls={this.props.controls}
          repeat={this.props.loop}
          resizeMode={this.props.fit as any}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 1,
            ...(aspectRatio
              ? {
                  position: 'absolute',
                }
              : null),
          }}
        >
        </ReactNativeVideo>
        {aspectRatio ? (
          <View
          pointerEvents="none"
            style={{
              width: '100%',
              paddingTop: aspectRatio * 100 + '%',
            }}
          />
        ) : null}
      </View>
    );
  }
}
