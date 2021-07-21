import { registerComponent } from '../functions/register-component';

export default function Text(props: { text: string }) {
  return <div class="builder-text" innerHTML={props.text} />;
}

registerComponent({ name: 'Text', inputs: [{ name: 'text', type: 'html' }] });
