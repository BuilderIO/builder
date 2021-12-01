import { FunctionComponent } from "react";

export interface SourceCodeLinkProps {
  fileName: string;
  line?: number;
  column?: number;
}

export const SourceCodeLink: FunctionComponent<SourceCodeLinkProps> = ({fileName, line, column, children, ...rest}) => {
  return (
    <a {...rest} href="#">
      {children}
    </a>
  );
}
