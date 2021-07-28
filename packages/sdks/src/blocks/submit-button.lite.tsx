import '@builder.io/mitosis';
import { registerComponent } from '../functions/register-component';

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default function SubmitButton(props: ButtonProps) {
  return (
    <button {...props.attributes} type="submit">
      {props.text}
    </button>
  );
}

registerComponent({
  name: 'Form:SubmitButton',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fdf2820ffed1f4349a94c40b3221f5b98',
  defaultStyles: {
    appearance: 'none',
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '25px',
    paddingRight: '25px',
    backgroundColor: '#3898EC',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  inputs: [
    {
      name: 'text',
      type: 'text',
      defaultValue: 'Click me',
    },
  ],
  static: true,
  noWrap: true,
  // TODO: optional children? maybe as optional form input
  // that only shows if advanced setting is flipped
  // TODO: defaultChildren
  // canHaveChildren: true,
});
