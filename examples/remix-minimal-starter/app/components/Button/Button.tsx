import { Builder } from '@builder.io/react';

export function Button(props) {
  return (
    <>
      {props.link ? (
        <>
          <a
            role="button"
            className="a-7ce05d40"
            href={props.link}
            target={props.openLinkInNewTab ? '_blank' : undefined}
            {...props.attributes}
          >
            {props.text}
          </a>
        </>
      ) : (
        <button className="button-7ce05d40" {...props.attributes}>
          {props.text}
        </button>
      )}
      <style>{`.button-7ce05d40 {
all: unset;
color: cyan;
}.a-7ce05d40 {
color: cyan;
}`}</style>
    </>
  );
}

Builder.registerComponent(Button, {
  name: 'Core:Button',
});
