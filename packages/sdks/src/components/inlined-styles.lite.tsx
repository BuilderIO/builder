interface Props {
  styles: string;
  id?: string;
}

export default function InlinedStyles(props: Props) {
  return <style innerHTML={props.styles} id={props.id} />;
}
