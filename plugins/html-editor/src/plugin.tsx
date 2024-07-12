/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Builder } from '@builder.io/sdk';
import JoditEditor from 'jodit-react';


const config = {
  useSplitMode: true,
  enableDragAndDropFileToEditor: true,
  uploader: {
    insertImageAsBase64URI: true
  }
}

interface TextProps {
  value: string;
  onChange: (value: string) => void;
}

function RichTextEditor(props: TextProps) {
  return (
    <JoditEditor
      value={props.value}
      onChange={props.onChange}
      config={config}
    />
  );
}

Builder.registerEditor({
  /**
   * Here we override the built-in richtext editor.
   */
  name: 'richText',
  component: RichTextEditor,
});
