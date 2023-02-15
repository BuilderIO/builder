export default function Text(props: { text: string }) {
  // useStyle(`
  // .builder-text > p:first-of-type, .builder-text > .builder-paragraph:first-of-type {
  //   margin: 0;
  // }
  // .builder-text > p, .builder-text > .builder-paragraph {
  //   color: 'inherit';
  //   line-height: 'inherit';
  //   letter-spacing: 'inherit';
  //   font-weight: 'inherit';
  //   font-size: 'inherit';
  //   text-align: 'inherit';
  //   font-family: 'inherit';
  // }
  // `);
  return (
    <span
      class="builder-text"
      innerHTML={props.text}
      style={{ outline: 'none' }}
    />
  );
}
