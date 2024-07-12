/**
 * @author Jason Chen <jhchen7@gmail.com>
 * @date 2022-06-18
 * @version 2.0.0
 * @url https://github.com/quilljs/quill
 * @file https://github.com/quilljs/quill/blob/develop/modules/clipboard.ts
 */

import Delta from 'quill-delta'

function deltaEndsWith(delta: Delta, text: string) {
  let endText = ''
  for (let i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
    const op = delta.ops[i]
    if (typeof op.insert !== 'string') break
    endText = op.insert + endText
  }
  return endText.slice(-1 * text.length) === text
}

export { deltaEndsWith }
