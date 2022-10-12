import { useStore } from '@builder.io/mitosis';

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
        ...props.attributes,
        ...state.videoProps,
      };
    },
  });
  return (
    <video
      {...state.spreadProps}
      style={{
        width: '100%',
        height: '100%',
        ...props.attributes?.style,
        objectFit: props.fit,
        objectPosition: props.position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        borderRadius: 1,
      }}
      src={props.video || 'no-src'}
      poster={props.posterImage}
    />
  );
}
