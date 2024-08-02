import type { BuilderNonceProp } from '../types/builder-props.js';

interface Props extends BuilderNonceProp {
  scriptStr: string;
  id: string;
}

export default function InlinedScript(props: Props) {
  return (
    <script
      innerHTML={props.scriptStr}
      data-id={props.id}
      nonce={props.nonce || ''}
    />
  );
}
