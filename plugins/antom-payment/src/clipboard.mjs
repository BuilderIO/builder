export async function copyPlainText(text, options = {}) {
  const navigatorObject = options.navigatorObject ?? globalThis.navigator;
  const clipboard = options.clipboard ?? navigatorObject?.clipboard;
  const ClipboardItemConstructor = options.ClipboardItemConstructor ?? globalThis.ClipboardItem;
  const BlobConstructor = options.BlobConstructor ?? globalThis.Blob;
  if (!clipboard) throw new Error('Clipboard API is not available.');
  let richWriteError;
  if (typeof clipboard.write === 'function' && typeof ClipboardItemConstructor !== 'undefined' && typeof BlobConstructor !== 'undefined') {
    try {
      await clipboard.write([new ClipboardItemConstructor({ 'text/plain': new BlobConstructor([text], { type: 'text/plain' }) })]);
      return;
    } catch (error) { richWriteError = error; }
  }
  if (typeof clipboard.writeText === 'function') {
    await clipboard.writeText(text);
    return;
  }
  throw richWriteError || new Error('Clipboard text writing is not available.');
}
