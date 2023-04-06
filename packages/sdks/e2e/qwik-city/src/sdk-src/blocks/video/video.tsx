import { Fragment, component$, h, useComputed$ } from "@builder.io/qwik";

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
  fit?: "contain" | "cover" | "fill";
  position?:
    | "center"
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "top left"
    | "top right"
    | "bottom left"
    | "bottom right";
  posterImage?: string;
  lazyLoad?: boolean;
}
export const Video = component$((props: VideoProps) => {
  const state: any = {};
  const videoProps = useComputed$(() => {
    return {
      ...(props.autoPlay === true
        ? {
            autoPlay: true,
          }
        : {}),
      ...(props.muted === true
        ? {
            muted: true,
          }
        : {}),
      ...(props.controls === true
        ? {
            controls: true,
          }
        : {}),
      ...(props.loop === true
        ? {
            loop: true,
          }
        : {}),
      ...(props.playsInline === true
        ? {
            playsInline: true,
          }
        : {}),
    };
  });
  const spreadProps = useComputed$(() => {
    return {
      ...props.attributes,
      ...videoProps.value,
    };
  });
  return (
    <video
      {...spreadProps.value}
      style={{
        width: "100%",
        height: "100%",
        ...props.attributes?.style,
        objectFit: props.fit,
        objectPosition: props.position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        borderRadius: 1,
      }}
      src={props.video || "no-src"}
      poster={props.posterImage}
    ></video>
  );
});

export default Video;
