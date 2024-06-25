import type { ComponentInfo } from '../../types/components.js';

export const componentInfo: ComponentInfo = {
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
        'https://cdn.builder.io/o/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd27731a526464deba0016216f5f9e570%2Fcompressed?apiKey=YJIGb4i01jvw0SRdL5Bt&token=d27731a526464deba0016216f5f9e570&alt=media&optimized=true',
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
      name: 'preload',
      type: 'text',
      defaultValue: 'metadata',
      enum: ['auto', 'metadata', 'none'],
    },
    {
      name: 'fitContent',
      type: 'boolean',
      helperText:
        'When child blocks are provided, fit to them instead of using the aspect ratio',
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
      defaultValue: 0.7004048582995948,
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
};
