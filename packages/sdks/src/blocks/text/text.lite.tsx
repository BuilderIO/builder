export default function Text(props: { text: string }) {
  return (
    <span
      class="builder-text"
      innerHTML={props.text}
      style={{ outline: 'none' }}
    />
  );
}
