export default function Text(props: { text?: string }) {
  return (
    <span
      class="builder-text"
      innerHTML={props.text?.toString() || ''}
      style={{ outline: 'none' }}
    />
  );
}
