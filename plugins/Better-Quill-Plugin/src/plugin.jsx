/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Builder } from '@builder.io/react';
import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import QuillBetterTable from 'quill-better-table';
import { html as beautifyHtml } from 'js-beautify';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { html as htmlLang } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { basicSetup } from 'codemirror';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import 'quill-better-table/dist/quill-better-table.css';

// Register the table module
Quill.register('modules/better-table', QuillBetterTable);

function RichTextEditor(props) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const containerRef = useRef(null);
  const codeEditorRef = useRef(null);
  const codeMirrorRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCodeView, setIsCodeView] = useState(false);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Comprehensive toolbar configuration
    const toolbarOptions = [
      // Text formatting
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
      // Text styles
      ['bold', 'italic', 'underline', 'strike'],
      
      // Text color and background
      [{ 'color': [] }, { 'background': [] }],
      
      // Superscript/subscript
      [{ 'script': 'sub'}, { 'script': 'super' }],
      
      // Lists and indentation
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      
      // Text alignment
      [{ 'align': [] }],
      
      // Block elements
      ['blockquote', 'code-block'],
      
      // Media
      ['link', 'image', 'video'],
      
      // Clean formatting
      ['clean']
    ];

    // Initialize Quill with all modules
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions,
        'better-table': {
          operationMenu: {
            items: {
              unmergeCells: {
                text: 'Unmerge cells'
              },
              insertColumnRight: {
                text: 'Insert column right'
              },
              insertColumnLeft: {
                text: 'Insert column left'
              },
              insertRowUp: {
                text: 'Insert row up'
              },
              insertRowDown: {
                text: 'Insert row down'
              },
              mergeCells: {
                text: 'Merge selected cells'
              },
              deleteColumn: {
                text: 'Delete column'
              },
              deleteRow: {
                text: 'Delete row'
              },
              deleteTable: {
                text: 'Delete table'
              }
            }
          }
        },
        keyboard: {
          bindings: QuillBetterTable.keyboardBindings
        }
      }
    });

    // Add table button to toolbar
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('table', function() {
      const tableModule = quill.getModule('better-table');
      tableModule.insertTable(3, 3);
    });

    // Set initial content
    if (props.value) {
      quill.root.innerHTML = props.value;
    }

    // Handle content changes
    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      if (props.onChange) {
        props.onChange(html);
      }
    });

    quillRef.current = quill;

    // Add custom table button to toolbar
    const tableButton = document.createElement('button');
    tableButton.innerHTML = '⊞';
    tableButton.className = 'ql-table';
    tableButton.title = 'Insert Table';
    tableButton.onclick = () => {
      const tableModule = quill.getModule('better-table');
      tableModule.insertTable(3, 3);
    };
    
    const toolbarElement = containerRef.current.querySelector('.ql-toolbar');
    if (toolbarElement) {
      toolbarElement.appendChild(tableButton);
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  // Update content when props change
  useEffect(() => {
    if (quillRef.current && props.value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== props.value && !isCodeView) {
        quillRef.current.root.innerHTML = props.value;
      }
    }
  }, [props.value]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleCodeView = () => {
    if (isCodeView) {
      // Switch back to visual editor
      if (quillRef.current && codeMirrorRef.current) {
        try {
          const newHtml = codeMirrorRef.current.state.doc.toString();
          quillRef.current.root.innerHTML = newHtml;
          if (props.onChange) {
            props.onChange(newHtml);
          }
        } catch (error) {
          console.error('Error updating editor:', error);
        }
      }
      setIsCodeView(false);
    } else {
      // Switch to code view
      if (quillRef.current && codeEditorRef.current) {
        try {
          const rawHtml = quillRef.current.root.innerHTML;
          const formattedHtml = beautifyHtml(rawHtml, {
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 1,
            preserve_newlines: true,
            end_with_newline: false,
            wrap_line_length: 0,
            indent_inner_html: true,
            unformatted: [],
            content_unformatted: ['pre', 'textarea']
          });
          
          // Initialize or update CodeMirror
          if (!codeMirrorRef.current) {
            const extensions = [
              basicSetup,
              htmlLang(),
              keymap.of([indentWithTab]),
              EditorView.lineWrapping
            ];
            
            // Add dark theme if enabled
            if (isDarkMode) {
              extensions.push(oneDark);
            }
            
            codeMirrorRef.current = new EditorView({
              state: EditorState.create({
                doc: formattedHtml,
                extensions: extensions
              }),
              parent: codeEditorRef.current
            });
          } else {
            codeMirrorRef.current.dispatch({
              changes: {
                from: 0,
                to: codeMirrorRef.current.state.doc.length,
                insert: formattedHtml
              }
            });
          }
          
          setIsCodeView(true);
        } catch (error) {
          console.error('Error formatting HTML:', error);
        }
      }
    }
  };

  // Cleanup CodeMirror on unmount
  useEffect(() => {
    return () => {
      if (codeMirrorRef.current) {
        codeMirrorRef.current.destroy();
        codeMirrorRef.current = null;
      }
    };
  }, []);

  const containerStyles = css`
    position: ${isFullscreen ? 'fixed' : 'relative'};
    top: ${isFullscreen ? '0' : 'auto'};
    left: ${isFullscreen ? '0' : 'auto'};
    width: ${isFullscreen ? '100vw' : '100%'};
    height: ${isFullscreen ? '100svh' : 'auto'};
    z-index: ${isFullscreen ? '99999' : 'auto'};
    background: ${isDarkMode ? '#191919' : '#ffffff'};
    display: flex;
    flex-direction: column;
    ${isFullscreen ? 'padding: 0; margin: 0;' : ''}
    
    .control-bar {
      display: flex;
      gap: 10px;
      padding: 12px 16px;
      background: ${isDarkMode ? '#252525' : '#f5f5f5'};
      border-bottom: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .control-button {
      padding: 8px 16px;
      border: none;
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
      color: ${isDarkMode ? '#ffffff' : '#1a1a1a'};
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      
      &:hover {
        background: ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
        transform: translateY(-1px);
        box-shadow: ${isDarkMode 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.08)'};
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &.active {
        background: ${isDarkMode ? '#0066cc' : '#0078d4'};
        color: white;
        box-shadow: ${isDarkMode 
          ? '0 4px 12px rgba(0, 102, 204, 0.3)' 
          : '0 4px 12px rgba(0, 120, 212, 0.2)'};
      }
    }
    
    .editor-wrapper {
      display: ${isCodeView ? 'none' : 'flex'};
      flex-direction: column;
      ${isFullscreen ? 'flex: 1; overflow: auto; padding: 20px; box-sizing: border-box;' : ''}
      
      > div {
        ${isFullscreen ? 'max-width: 800px; width: 100%; margin: 0 auto;' : 'width: 100%;'}
      }
    }
    
    .code-editor {
      ${isFullscreen ? 'flex: 1; padding: 20px;' : 'height: 400px;'}
      display: ${isCodeView ? 'block' : 'none'};
      margin: 0;
      width: 100%;
      box-sizing: border-box;
      overflow: auto;
      background: ${isDarkMode ? '#191919' : '#ffffff'};
      
      ${isFullscreen ? '> * { max-width: 800px; margin: 0 auto; }' : ''}
      
      .cm-editor {
        height: ${isFullscreen ? 'calc(100svh - 85px)' : '400px'};
        font-size: 14px;
        border: 1px solid ${isDarkMode ? '#393939' : '#e0e0e0'};
        
        .cm-scroller {
          overflow: auto;
          height: 100%;
        }
        
        .cm-gutters {
          background: ${isDarkMode ? '#252525' : '#f5f5f5'};
          border-right: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
        }
      }
    }
    
    .ql-container {
      ${isFullscreen ? 'height: calc(100svh - 150px);' : 'height: 400px;'}
      overflow-y: auto;
      font-size: 14px;
      scroll-behavior: smooth;
      
      &::-webkit-scrollbar {
        width: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#191919' : '#f5f5f5'};
      }
      
      &::-webkit-scrollbar-thumb {
        background: ${isDarkMode ? '#404040' : '#c0c0c0'};
        border-radius: 4px;
      }
      
      &::-webkit-scrollbar-thumb:hover {
        background: ${isDarkMode ? '#505050' : '#a0a0a0'};
      }
    }
    
    .ql-editor {
      min-height: 100%;
      background: ${isDarkMode ? '#191919' : '#ffffff'};
      color: ${isDarkMode ? '#ffffff' : '#191919'};
      padding: 20px;
      font-size: 15px;
      line-height: 1.6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      
      &:focus {
        outline: none;
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-weight: 600;
        color: ${isDarkMode ? '#ffffff' : '#191919'} !important;
      }
      
      p {
        margin-bottom: 12px;
      }
      
      ul, ol {
        padding-left: 24px;
        margin-bottom: 12px;
      }
      
      blockquote {
        border-left: 4px solid ${isDarkMode ? '#4da6ff' : '#0078d4'};
        padding-left: 16px;
        margin-left: 0;
        color: ${isDarkMode ? '#b0b0b0' : '#666666'};
      }
      
      code {
        background: ${isDarkMode ? '#2d2d2d' : '#f5f5f5'};
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      pre {
        background: ${isDarkMode ? '#2d2d2d' : '#f5f5f5'};
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
      }
    }
    
    .ql-toolbar {
      background: ${isDarkMode ? '#252525' : '#ffffff'};
      border: 1px solid ${isDarkMode ? '#393939' : '#e0e0e0'};
      border-bottom: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
    
    .ql-toolbar .ql-formats {
      margin-right: 0px !important;
      display: flex;
      gap: 2px;
      align-items: center;
      padding: 0 4px;
      border-right: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
    }
    
    .ql-toolbar .ql-formats:last-child {
      border-right: none;
    }
    
    .ql-toolbar button {
      width: 32px !important;
      height: 32px !important;
      padding: 6px !important;
      border-radius: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .ql-toolbar button svg {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ql-toolbar .ql-stroke {
      stroke: ${isDarkMode ? '#ffffff' : '#191919'};
      stroke-width: 2;
      transition: all 0.15s ease;
    }
    
    .ql-toolbar .ql-fill {
      fill: ${isDarkMode ? '#ffffff' : '#191919'};
      transition: all 0.15s ease;
    }
    
    .ql-toolbar .ql-picker {
      height: 32px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    
    .ql-toolbar .ql-picker-label {
      color: ${isDarkMode ? '#ffffff' : '#191919'};
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      transition: all 0.15s ease;
      display: flex !important;
      align-items: center !important;
    }
    
    .ql-toolbar .ql-picker-label:hover {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    }
    
    .ql-toolbar button:hover {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
      transform: translateY(-1px);
    }
    
    .ql-toolbar button:active {
      transform: translateY(0);
    }
    
    .ql-toolbar button.ql-active {
      background: ${isDarkMode ? 'rgba(0, 102, 204, 0.3)' : 'rgba(0, 120, 212, 0.15)'};
    }
    
    .ql-toolbar button.ql-active .ql-stroke {
      stroke: ${isDarkMode ? '#4da6ff' : '#0078d4'};
    }
    
    .ql-toolbar button.ql-active .ql-fill {
      fill: ${isDarkMode ? '#4da6ff' : '#0078d4'};
    }
    
    .ql-toolbar .ql-picker-label.ql-active {
      background: ${isDarkMode ? 'rgba(0, 102, 204, 0.3)' : 'rgba(0, 120, 212, 0.15)'};
      color: ${isDarkMode ? '#4da6ff' : '#0078d4'};
    }
    
    .ql-container.ql-snow {
      border: 1px solid ${isDarkMode ? '#393939' : '#e0e0e0'};
      border-top: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
    }
    
    .ql-picker-options {
      background: ${isDarkMode ? '#252525' : '#ffffff'} !important;
      border: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
      border-radius: 8px;
      padding: 6px;
      box-shadow: ${isDarkMode 
        ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
        : '0 8px 24px rgba(0, 0, 0, 0.12)'};
      margin-top: 4px;
    }
    
    .ql-snow .ql-picker.ql-expanded .ql-picker-options {
      background: ${isDarkMode ? '#252525' : '#ffffff'} !important;
      border: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'} !important;
    }
    
    .ql-picker-item {
      color: ${isDarkMode ? '#ffffff' : '#191919'} !important;
      padding: 8px 12px;
      border-radius: 4px;
      transition: all 0.15s ease;
    }
    
    .ql-picker-item:hover {
      background: ${isDarkMode ? '#191919' : '#f0f0f0'} !important;
    }
    
    .ql-picker-options .ql-picker-item {
      color: ${isDarkMode ? '#ffffff' : '#191919'} !important;
      background: transparent !important;
    }
    
    .ql-picker-options .ql-picker-item:hover {
      background: ${isDarkMode ? '#191919' : '#f0f0f0'} !important;
    }
    
    .ql-snow .ql-picker-options .ql-picker-item {
      color: ${isDarkMode ? '#ffffff' : '#191919'} !important;
      background: transparent !important;
    }
    
    .ql-snow .ql-picker-options .ql-picker-item:hover {
      background: ${isDarkMode ? '#191919' : '#f0f0f0'} !important;
    }
    
    .ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item {
      color: ${isDarkMode ? '#ffffff' : '#191919'} !important;
      background: transparent !important;
    }
    
    .ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item:hover {
      background: ${isDarkMode ? '#191919' : '#f0f0f0'} !important;
    }

    /* Table styles */
    .quill-better-table-wrapper {
      overflow-x: auto;
    }
    
    .ql-table {
      font-size: 20px;
      padding: 3px 5px;
    }

    /* Code block syntax highlighting */
    .ql-editor pre.ql-syntax {
      background-color: ${isDarkMode ? '#282c34' : '#f5f5f5'};
      color: ${isDarkMode ? '#abb2bf' : '#383a42'};
      overflow: visible;
      border-radius: 4px;
      padding: 16px;
      margin: 8px 0;
    }

    /* Code inline */
    .ql-editor code {
      background-color: ${isDarkMode ? '#2d2d2d' : '#f4f4f4'};
      color: ${isDarkMode ? '#e06c75' : '#e45649'};
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    /* Blockquote */
    .ql-editor blockquote {
      border-left: 4px solid ${isDarkMode ? '#61afef' : '#007acc'};
      background: ${isDarkMode ? '#2d2d2d' : '#f9f9f9'};
      padding: 10px 20px;
      margin: 8px 0;
    }

    /* Links */
    .ql-editor a {
      color: ${isDarkMode ? '#61afef' : '#0066cc'};
      text-decoration: underline;
    }

    /* Images and videos */
    .ql-editor img,
    .ql-editor video {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 8px 0;
    }
  `;

  return (
    <div ref={containerRef} css={containerStyles}>
      <div className="control-bar">
        <button 
          className={`control-button ${isDarkMode ? 'active' : ''}`}
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button 
          className={`control-button ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? '⊡ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
        <button 
          className={`control-button ${isCodeView ? 'active' : ''}`}
          onClick={toggleCodeView}
          title="Toggle Code View"
        >
          {isCodeView ? '👁️ Visual' : '</> Code'}
        </button>
      </div>
      
      <div className="editor-wrapper">
        <div ref={editorRef}></div>
      </div>
      
      <div className="code-editor" ref={codeEditorRef}></div>
    </div>
  );
}

// Register the editor with Builder
Builder.registerEditor({
  name: 'RichText',
  component: RichTextEditor
});
