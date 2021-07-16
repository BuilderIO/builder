import { registerComponent } from '../functions/register-component';

export default function Text(props: { text: string }) {
  return <div className="builder-text" innerHTML={props.text} />;
}

registerComponent({ name: 'Text' });
