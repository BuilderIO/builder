/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useRef, useEffect } from 'react';
import { Builder } from '@builder.io/sdk';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './styles/global.css';
import Typography, { AllowedTags } from './formats/typography';

Quill.register(Typography, true);

const getStringifiedFormat = (tag: AllowedTags, className: string): string =>
  JSON.stringify({ tag, className });

const modules = {
  toolbar: [
    [
      {
        typography: [
          getStringifiedFormat('P', ''),
          getStringifiedFormat('H1', ''),
          getStringifiedFormat('H2', ''),
          getStringifiedFormat('H3', ''),
          getStringifiedFormat('H4', ''),
          getStringifiedFormat('H5', ''),
          getStringifiedFormat('H6', ''),
          getStringifiedFormat('P', 'small'),
          getStringifiedFormat('P', 'medium'),
          getStringifiedFormat('P', 'large'),
          getStringifiedFormat('SPAN', 'small'),
          getStringifiedFormat('SPAN', 'large')
        ]
      }
    ],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'typography',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
];

interface TextProps {
  value: string;
  onChange: () => void;
}

function RichTextEditor(props: TextProps) {
  const quillRef = useRef<ReactQuill>(null!);

  useEffect(() => {
    const quill  = quillRef.current.getEditor(); // Access the Quill instance

    // Set default content with a specific format
    const delta = quill.clipboard.convert('<p>Enter text...</p>');
    quill.setContents(delta);

    // Optionally, set a default format
    // quill.format('typography', getStringifiedFormat('P', 'medium'));
  }, []);

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={props.value}
      onChange={props.onChange}
      modules={modules}
      formats={formats}
    />
  );
}

Builder.registerEditor({
  /**
   * Here we override the built-in richtext editor.
   */
  name: 'html',
  component: RichTextEditor,
});
