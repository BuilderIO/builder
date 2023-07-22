/**
 * @author @kensnyder
 * @date 2018-07-17
 * @version 3.0.0
 * @url https://github.com/kensnyder/quill-image-resize-module
 * @file https://github.com/kensnyder/quill-image-resize-module/blob/master/src/DefaultOptions.js
 */

export default {
  modules: ['DisplaySize', 'Toolbar', 'Resize'],
  overlayStyles: {
    position: 'absolute',
    boxSizing: 'border-box',
    border: '1px dashed #444',
  },
  handleStyles: {
    position: 'absolute',
    height: '12px',
    width: '12px',
    backgroundColor: 'white',
    border: '1px solid #777',
    boxSizing: 'border-box',
    opacity: '0.80',
  },
  displayStyles: {
    position: 'absolute',
    font: '12px/1.0 Arial, Helvetica, sans-serif',
    padding: '4px 8px',
    textAlign: 'center',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #777',
    boxSizing: 'border-box',
    opacity: '0.80',
    cursor: 'default',
  },
  toolbarStyles: {
    position: 'absolute',
    top: '-12px',
    right: '0',
    left: '0',
    height: '0',
    minWidth: '100px',
    font: '12px/1.0 Arial, Helvetica, sans-serif',
    textAlign: 'center',
    color: '#333',
    boxSizing: 'border-box',
    cursor: 'default',
  },
  toolbarButtonStyles: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    background: 'white',
    border: '1px solid #999',
    verticalAlign: 'middle',
  },
  toolbarButtonSvgStyles: {
    fill: '#444',
    stroke: '#444',
    strokeWidth: '2',
  },
}
