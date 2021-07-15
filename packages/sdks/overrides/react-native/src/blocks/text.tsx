import HTML from 'react-native-render-html';

export function Text(props: { text: string }) {
  return <HTML source={{ html: props.text }} />;
}
