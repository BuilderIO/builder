export default function Text(props: { text: string }) {
  return <div class="builder-text" innerHTML={props.text} />;
}
