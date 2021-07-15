import 'react';
import { registerComponent } from '../functions/register-component';

export default function Text(props: { text: string }) {
  // TODO: react native needs a swap here to use https://github.com/meliorence/react-native-render-html
  return <div className="builder-text" dangerouslySetInnerHTML={{ __html: props.text }} />;
}

registerComponent(Text, { name: 'Text' });
