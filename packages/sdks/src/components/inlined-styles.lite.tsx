import type { BuilderNonceProp } from '../types/builder-props.js';

interface Props extends BuilderNonceProp {
  styles: string;
  id: string;
}

export default function InlinedStyles(props: Props) {
  return (
    <style innerHTML={props.styles} data-id={props.id} nonce={props.nonce} />
  );
}
