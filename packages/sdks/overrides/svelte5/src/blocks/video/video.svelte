<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte';
  import { styleString } from '../../helpers/style-string.js';
  import type { VideoProps } from './video.types.js';

  let {
    attributes,
    video,
    autoPlay,
    controls,
    muted,
    loop,
    playsInline,
    aspectRatio,
    fit,
    preload,
    position,
    posterImage,
    lazyLoad,
    fitContent,
    builderBlock,
    children,
  }: VideoProps & { children?: Snippet } = $props();

  const spreadProps = $derived({
    ...(autoPlay === true ? { autoplay: true } : {}),
    ...(muted === true ? { muted: true } : {}),
    ...(controls === true ? { controls: true } : {}),
    ...(loop === true ? { loop: true } : {}),
    ...(playsInline === true ? { playsinline: true } : {}),
  });

  // The block's own style is a string on this target (an object elsewhere).
  const videoStyle = $derived.by(() => {
    const blockStyle = attributes?.style;
    const own = styleString({
      width: '100%',
      height: '100%',
      ...(blockStyle && typeof blockStyle === 'object' ? blockStyle : {}),
      objectFit: fit,
      objectPosition: position,
      // Hack to get object fit to work as expected and
      // not have the video overflow
      borderRadius: '1px',
      ...(aspectRatio ? { position: 'absolute' } : null),
    });
    return typeof blockStyle === 'string' && blockStyle ? `${own} ${blockStyle}` : own;
  });

  const hasChildren = $derived(!!builderBlock?.children?.length);

  let videoRef = $state<HTMLVideoElement>();
  let lazyVideoObserver: IntersectionObserver | undefined;

  onMount(() => {
    if (lazyLoad) {
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
      lazyVideoObserver = oberver;
    }
  });

  onDestroy(() => {
    lazyVideoObserver?.disconnect();
  });
</script>

<div style="position:relative;">
  <video
    {...spreadProps}
    bind:this={videoRef}
    preload={lazyLoad ? 'none' : preload || 'metadata'}
    style={videoStyle}
    poster={posterImage}
    class="builder-video"
  >
    <source type="video/mp4" {...lazyLoad ? { 'data-src': video } : { src: video }} />
  </video>
  <!-- preserve aspect ratio trick. Only applies when there are no children meant to fit the content width. -->
  {#if aspectRatio && !(fitContent && hasChildren)}
    <div
      style={styleString({
        width: '100%',
        paddingTop: aspectRatio * 100 + '%',
        pointerEvents: 'none',
        fontSize: '0px',
      })}
    ></div>
  {/if}
  {#if hasChildren && fitContent}
    <div style="display:flex;flex-direction:column;align-items:stretch;">
      {@render children?.()}
    </div>
  {/if}
  {#if hasChildren && !fitContent}
    <div
      style="pointer-events:none;display:flex;flex-direction:column;align-items:stretch;position:absolute;top:0;left:0;width:100%;height:100%;"
    >
      {@render children?.()}
    </div>
  {/if}
</div>
