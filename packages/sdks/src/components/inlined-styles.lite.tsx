interface Props {
  styles: string;
  id: string;
  dataId: string;
}

export default function InlinedStyles(props: Props) {
  return (
    <style innerHTML={props.styles} id={props.id} data-id={props.dataId} />
  );
}
