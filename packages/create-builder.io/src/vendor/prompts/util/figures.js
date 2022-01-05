const main = {
  tick: '✔',
  cross: '✖',
  ellipsis: '…',
  pointerSmall: '›',
  line: '─',
  pointer: '❯',
};
const win = {
  tick: '√',
  cross: '×',
  ellipsis: '...',
  pointerSmall: '»',
  line: '─',
  pointer: '>',
};
const figures = process.platform === 'win32' ? win : main;

export default figures;
