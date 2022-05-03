import { componentInfo } from './component-info';
import '@builder.io/mitosis';
import { useMetadata } from '@builder.io/mitosis';

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

useMetadata({ componentInfo });
