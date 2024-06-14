/**
 * @author @kensnyder
 * @date 2022-06-18
 * @version 1.0.3
 * @url https://github.com/kensnyder/quill-image-drop-module
 * @file https://github.com/kensnyder/quill-image-drop-module/blob/master/src/ImageDrop.js
 */

import Quill from 'quill'

/**
 * Custom module for quilljs to allow user to drag images from their file system into the editor
 * and paste images from clipboard (Works on Chrome, Firefox, Edge, not on Safari)
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
class ImageDrop {
  quill: Quill
  /**
   * Instantiate the module given a quill instance and any options
   * @param {Quill} quill
   * @param {Object} options
   */
  constructor(quill: Quill, options = {}) {
    // save the quill reference
    this.quill = quill
    // bind handlers to this instance
    this.handleDrop = this.handleDrop.bind(this)
    this.handlePaste = this.handlePaste.bind(this)
    // listen for drop and paste events
    this.quill.root.addEventListener('drop', this.handleDrop, false)
    this.quill.root.addEventListener('paste', this.handlePaste, false)
  }

  /**
   * Handler for drop event to read dropped files from evt.dataTransfer
   * @param {Event} evt
   */
  handleDrop(evt: DragEvent) {
    evt.preventDefault()
    if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
      const files: File[] = Array.from(evt.dataTransfer.files)
      this.readFiles(files, this.insert.bind(this))
    }
  }

  /**
   * Handler for paste event to read pasted files from evt.clipboardData
   * @param {Event} evt
   */
  handlePaste(evt: ClipboardEvent) {
    if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length) {
      const isImage = Array.from(evt.clipboardData.items).filter(item =>
        item.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i),
      )
      if (isImage.length > 0) {
        evt.preventDefault()
        const files: File[] = Array.from(isImage).map(item => item.getAsFile() || new File([], ''))
        this.readFiles(files, this.insert.bind(this))
      }
    }
  }

  /**
   * Insert the image into the document at the current cursor position
   * @param {String} dataUrl  The base64-encoded image URI
   */
  insert(dataUrl: string) {
    const index = (this.quill.getSelection() || {}).index || this.quill.getLength()
    this.quill.insertEmbed(index, 'image', dataUrl, 'user')
  }

  /**
   * Extract image URIs a list of files from evt.dataTransfer or evt.clipboardData
   * @param {File[]} files  One or more File objects
   * @param {Function} callback  A function to send each data URI to
   */
  readFiles(files: File[], callback: Function) {
    files.forEach(file => {
      if (!file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i)) {
        // file is not an image
        // Note that some file formats such as psd start with image/* but are not readable
        return
      }

      const reader = new FileReader()

      reader.onload = (evt: any) => {
        callback(evt.target.result)
      }

      reader.readAsDataURL(file)
    })
  }
}

export { ImageDrop }
