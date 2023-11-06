import { createSignal } from "solid-js";

function Video(props) {
  function videoProps() {
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
  }

  function spreadProps() {
    return { ...props.attributes, ...videoProps() };
  }

  return (
    <video
      {...spreadProps()}
      preload={props.preload || "metadata"}
      style={{
        width: "100%",
        height: "100%",
        ...props.attributes?.style,
        "object-fit": props.fit,
        "object-position": props.position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        "border-radius": 1,
      }}
      src={props.video || "no-src"}
      poster={props.posterImage}
    ></video>
  );
}

export default Video;
