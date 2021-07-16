import HTML from 'react-native-render-html';
import { registerComponent } from '../functions/register-component';

export default function Text(props: { text: string }) {
  return <HTML source={{ html: props.text }} />;
}

console.log('loaded?')

registerComponent(Text, { name: 'Text' });
