import { FunctionComponent } from 'react';

export interface SourceCodeLinkProps {
  fileName: string;
  line?: number;
  column?: number;
}

export const SourceCodeLink: FunctionComponent<SourceCodeLinkProps> = ({ children }) => {
  return <div>{children}</div>;
};
