import { Fragment, component$, h, useStylesScoped$ } from "@builder.io/qwik";

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}
export const Button = component$((props: ButtonProps) => {
  useStylesScoped$(STYLES);

  return (
    <>
      {props.link ? (
        <a
          role="button"
          {...props.attributes}
          href={props.link}
          target={props.openLinkInNewTab ? "_blank" : undefined}
        >
          {props.text}
        </a>
      ) : (
        <button
          class={(() => {
            /** * We have to explicitly provide `class` so that Mitosis knows to merge it with `css`. */
            props.attributes.class + " button-Button";
          })()}
          {...props.attributes}
        >
          {props.text}
        </button>
      )}
    </>
  );
});

export default Button;

export const STYLES = `
.button-Button {
  all: unset;
}
`;
