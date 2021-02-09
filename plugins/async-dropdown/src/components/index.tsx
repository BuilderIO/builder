/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/sdk';
import React, { useRef } from 'react';
import { observer } from 'mobx-react';
import { MultipleDropdowns as _MultipleDropdowns } from './MultipleDropdowns';
import { SingleDropdown as _SingleDropdown } from './SingleDropdown';
import { getDependenciesKeyFrom } from '../helpers/getDependenciesKeyFrom';

export const Component = observer((props: any) => {
  const { expectMultipleDropdowns } = props.field.options;
  const newDependenciesKey = getDependenciesKeyFrom(props);
  const dependenciesKeyRef = useRef(newDependenciesKey);

  const targeting = props.context.designerState.editingContentModel.query
    .toJSON()
    .reduce((accum: any, q: any) => ({ ...accum, [q.property]: q.value }), {});

  const newProps = { ...props, newDependenciesKey, targeting };

  if (expectMultipleDropdowns) {
    return <MultipleDropdowns {...newProps} ref={dependenciesKeyRef} />;
  } else {
    return <SingleDropdown {...newProps} ref={dependenciesKeyRef} />;
  }
});

const MultipleDropdowns = React.forwardRef((props, ref) => {
  return <_MultipleDropdowns {...props} dependenciesKeyRef={ref} />;
});

const SingleDropdown = React.forwardRef((props, ref) => {
  return <_SingleDropdown {...props} dependenciesKeyRef={ref} />;
});

Builder.registerEditor({
  name: 'dynamic-dropdown',
  component: Component,
});
