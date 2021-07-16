import HTML from 'react-native-render-html';
import { registerComponent } from '../functions/register-component';

export default function Text(props: { text: string }) {
  console.log('text', props);
  return <HTML source={{ html: props.text }} />;
}

registerComponent(Text, { name: 'Text' });
