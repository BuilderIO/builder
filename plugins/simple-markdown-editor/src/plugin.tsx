/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/sdk';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

interface TextProps {
  value: string;
  onChange: () => void;
}

function SimpleMarkDownEditor({value, onChange}: TextProps) {
  return (
      <SimpleMDE value={value} onChange={onChange} />
  );
}

Builder.registerEditor({
  name: 'Simple Markdon',
  component: SimpleMarkDownEditor,
});

export default SimpleMarkDownEditor