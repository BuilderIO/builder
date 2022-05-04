function Video(props) {
  return (
    <video
      {...props.attributes}
      preload="none"
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
      key={props.video || "no-src"}
      poster={props.posterImage}
      autoPlay={props.autoPlay}
      muted={props.muted}
      controls={props.controls}
      loop={props.loop}
    ></video>
  );
}

export default Video;
