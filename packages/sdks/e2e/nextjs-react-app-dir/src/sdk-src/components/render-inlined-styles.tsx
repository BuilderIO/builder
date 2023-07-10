import * as React from 'react';

interface Props {
  styles: string;
  id?: string;
}

function RenderInlinedStyles(props: Props) {
  return (
    <style dangerouslySetInnerHTML={{ __html: props.styles }} id={props.id} />
  );
}

export default RenderInlinedStyles;
