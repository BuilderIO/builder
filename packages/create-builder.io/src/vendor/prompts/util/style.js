import { cyan, gray, green, red } from 'colorette';
import figures from './figures';

// rendering user input.
const styles = Object.freeze({
  password: { scale: 1, render: input => '*'.repeat(input.length) },
  emoji: { scale: 2, render: input => '😃'.repeat(input.length) },
  invisible: { scale: 0, render: input => '' },
  default: { scale: 1, render: input => `${input}` },
});
const render = type => styles[type] || styles.default;

// icon to signalize a prompt.
const symbols = Object.freeze({
  aborted: red(figures.cross),
  done: green(figures.tick),
  default: cyan('?'),
});

const symbol = (done, aborted) => (aborted ? symbols.aborted : done ? symbols.done : symbols.default);

// between the question and the user's input.
const delimiter = completing => gray(completing ? figures.ellipsis : figures.pointerSmall);

const item = (expandable, expanded) => gray(expandable ? (expanded ? figures.pointerSmall : '+') : figures.line);

export { styles, render, symbols, symbol, delimiter, item };
