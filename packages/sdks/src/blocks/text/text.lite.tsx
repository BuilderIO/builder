export default function Text(props: { text?: string }) {
  return (
    <div
      class={
        /* NOTE: This class name must be "builder-text" for inline editing to work in the Builder editor */
        'builder-text'
      }
      innerHTML={props.text?.toString() || ''}
      style={{ outline: 'none' }}
    />
  );
}
