import * as React from "react";

interface Props {
  styles: string;
  id?: string;
}

function InlinedStyles(props: Props) {
  // console.log("InlinedStyles:", {content: props.styles});
  
  return (
    <style dangerouslySetInnerHTML={{ __html: props.styles }} id={props.id} />
  );
}

export default InlinedStyles;
