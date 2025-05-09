import {
  Show,
  onMount,
  onUnMount,
  useMetadata,
  useRef,
  useStore,
} from '@builder.io/mitosis';
import type { VideoProps } from './video.types.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
  angular: {
    selector: 'builder-video',
  },
});

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
    lazyVideoObserver: undefined as IntersectionObserver | undefined,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  onMount(
    () => {
      if (props.lazyLoad) {
        const oberver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            const videoElement = entry.target as HTMLVideoElement;
            try {
              // Convert HTMLCollection to Array and filter for source elements
              Array.from(videoElement.children)
                .filter(
                  (child): child is HTMLSourceElement =>
                    child instanceof HTMLElement && child.tagName === 'SOURCE'
                )
                .forEach((source) => {
                  const src = source.dataset.src;
                  if (src) {
                    source.src = src;
                  }
                });

              videoElement.load();
              oberver.unobserve(videoElement);
            } catch (error) {
              console.error('Error loading lazy video:', error);
            }
          });
        });
        if (videoRef) {
          oberver.observe(videoRef);
        }
        state.lazyVideoObserver = oberver;
      }
    },
    {
      onSSR: false,
    }
  );

  onUnMount(() => {
    if (state.lazyVideoObserver) {
      state.lazyVideoObserver.disconnect();
    }
  });

  return (
    <div style={{ position: 'relative' }}>
      <video
        {...state.spreadProps}
        ref={videoRef}
        preload={props.lazyLoad ? 'none' : props.preload || 'metadata'}
        style={{
          width: '100%',
          height: '100%',
          ...props.attributes?.style,
          objectFit: props.fit,
          objectPosition: props.position,
          // Hack to get object fit to work as expected and
          // not have the video overflow
          borderRadius: '1px',
          ...(props.aspectRatio
            ? {
                position: 'absolute',
              }
            : null),
        }}
        poster={props.posterImage}
        class="builder-video"
      >
        <source
          type="video/mp4"
          {...(props.lazyLoad
            ? { 'data-src': props.video }
            : { src: props.video })}
        />
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
