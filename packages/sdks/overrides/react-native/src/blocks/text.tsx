import HTML from 'react-native-render-html';

export default function Text(props: { text: string }) {
  return <HTML source={{ html: props.text }} />;
}
