import { Show } from "solid-js";
import { css } from "solid-styled-components";

function Image(props) {
  return <div class={css({
    position: "relative"
  })}>
      <picture>
        <img class={"builder-image" + (props.className ? " " + props.className : "") + " " + css({
        opacity: "1",
        transition: "opacity 0.2s ease-in-out",
        position: "absolute",
        height: "100%",
        width: "100%",
        top: "0px",
        left: "0px"
      })} loading="lazy" alt={props.altText} role={props.altText ? "presentation" : undefined} style={{
        "object-position": props.backgroundSize || "center",
        "object-fit": props.backgroundSize || "cover"
      }} src={props.image} srcset={props.srcset} sizes={props.sizes} />
        <source srcSet={props.srcset} />
      </picture>
      <Show when={props.aspectRatio && !(props.fitContent && props.builderBlock?.children?.length)}>
        <div class={css({
        width: "100%",
        pointerEvents: "none",
        fontSize: "0"
      })} style={{
        "padding-top": props.aspectRatio * 100 + "%"
      }}>
          {" "}
        </div>
      </Show>
      <Show when={props.builderBlock?.children?.length && props.fitContent}>
        {props.children}
      </Show>
      <Show when={!props.fitContent}>
        <div class={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%"
      })}>
          {props.children}
        </div>
      </Show>
    </div>;
}

export default Image;