import React from 'react';
import { Link } from '../../components/Link';

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

export const ButtonComponent : React.FC<ButtonProps> = (props) => {
  const Tag = props.link ? Link : 'span';
  return (
    <Tag
      role="button"
      href={props.link}
      target={props.openLinkInNewTab ? '_blank' : undefined}
      {...props.attributes}
    >
      {props.text}
    </Tag>
  );
}
