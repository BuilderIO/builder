import { Show, useMetadata, useStore } from '@builder.io/mitosis';
import type { BuilderBlock } from '../../types/builder-block.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export interface VideoProps {
  attributes?: any;
  video?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  aspectRatio?: number;
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill';
  preload?: 'auto' | 'metadata' | 'none';
  position?:
    | 'center'
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'top left'
    | 'top right'
    | 'bottom left'
    | 'bottom right';
  posterImage?: string;
  lazyLoad?: boolean;
  children?: any;
  fitContent?: boolean;
  builderBlock?: BuilderBlock;
}

export default function Video(props: VideoProps) {
  const state = useStore({
    get videoProps() {
      return {
        ...(props.autoPlay === true ? { autoPlay: true } : {}),
        ...(props.muted === true ? { muted: true } : {}),
        ...(props.controls === true ? { controls: true } : {}),
        ...(props.loop === true ? { loop: true } : {}),
        ...(props.playsInline === true ? { playsInline: true } : {}),
      };
    },
    get spreadProps() {
      return {
        ...state.videoProps,
      };
    },
  });

  return (
    <div style={{ position: 'relative' }}>
      <video
        {...state.spreadProps}
        preload={props.preload || 'metadata'}
        style={{
          width: '100%',
          height: '100%',
          ...props.attributes?.style,
          objectFit: props.fit,
          objectPosition: props.position,
          // Hack to get object fit to work as expected and
          // not have the video overflow
          zIndex: 2,
          borderRadius: '1px',
          ...(props.aspectRatio
            ? {
                position: 'absolute',
              }
            : null),
        }}
        src={props.video || 'no-src'}
        poster={props.posterImage}
        class="builder-video"
      >
        {!props.lazyLoad && <source type="video/mp4" src={props.video} />}
      </video>
      {/* preserve aspect ratio trick. Only applies when there are no children meant to fit the content width. */}
      <Show
        when={
          props.aspectRatio &&
          !(props.fitContent && props.builderBlock?.children?.length)
        }
      >
        <div
          style={{
            width: '100%',
            paddingTop: props.aspectRatio! * 100 + '%',
            pointerEvents: 'none',
            fontSize: '0px',
          }}
        />
      </Show>
      <Show when={props.builderBlock?.children?.length && props.fitContent}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          {props.children}
        </div>
      </Show>
      <Show when={props.builderBlock?.children?.length && !props.fitContent}>
        <div
          style={{
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }}
        >
          {props.children}
        </div>
      </Show>
    </div>
  );
}
