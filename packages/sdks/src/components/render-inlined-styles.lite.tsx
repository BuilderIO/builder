interface Props {
  styles: string;
  id?: string;
}

export default function RenderInlinedStyles(props: Props) {
  return <style innerHTML={props.styles} id={props.id} />;
}
