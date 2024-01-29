/**
 * @author Jason Chen <jhchen7@gmail.com>
 * @date 2022-06-18
 * @version 2.0.0
 * @url https://github.com/quilljs/quill
 * @file https://github.com/quilljs/quill/blob/develop/modules/clipboard.ts
 */

import Delta from 'quill-delta'

function applyFormat(delta: Delta, formats: Record<string, unknown>): Delta
function applyFormat(delta: Delta, format: string, value: unknown): Delta
function applyFormat(
  delta: Delta,
  format: string | Record<string, unknown>,
  value?: unknown,
): Delta {
  if (typeof format === 'object') {
    return Object.keys(format).reduce((newDelta, key) => {
      return applyFormat(newDelta, key, format[key])
    }, delta)
  }
  return delta.reduce((newDelta, op) => {
    if (op.attributes && op.attributes[format]) {
      return newDelta.push(op)
    }
    const formats = value ? { [format]: value } : {}
    return newDelta.insert(op.insert || '', { ...formats, ...op.attributes })
  }, new Delta())
}

export { applyFormat }
