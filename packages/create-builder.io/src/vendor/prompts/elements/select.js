import { bold, cyan, gray, green } from 'colorette';
import { Prompt } from './prompt';
import { style, clear, figures } from '../util';
import { erase, cursor } from 'sisteransi';

/**
 * SelectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {Number} [opts.initial] Index of default value
 */
export class SelectPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
    this.cursor = opts.initial || 0;
    this.values = opts.choices || [];
    this.value = opts.choices[this.cursor].value;
    this.clear = clear('');
    this.render(true);
  }

  moveCursor(n) {
    this.cursor = n;
    this.value = this.values[n].value;
    this.fire();
  }

  reset() {
    this.moveCursor(0);
    this.fire();
    this.render();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  first() {
    this.moveCursor(0);
    this.render();
  }

  last() {
    this.moveCursor(this.values.length - 1);
    this.render();
  }

  up() {
    if (this.cursor === 0) return this.bell();
    this.moveCursor(this.cursor - 1);
    this.render();
  }

  down() {
    if (this.cursor === this.values.length - 1) return this.bell();
    this.moveCursor(this.cursor + 1);
    this.render();
  }

  next() {
    this.moveCursor((this.cursor + 1) % this.values.length);
    this.render();
  }

  _(c, key) {
    if (c === ' ') return this.submit();
  }

  render(first) {
    if (first) this.out.write(cursor.hide);
    else this.out.write(erase.lines(this.values.length + 2));

    // Print prompt
    this.out.write(
      [style.symbol(this.done, this.aborted), bold(this.msg), style.delimiter(false), this.done ? green(this.values[this.cursor].title.split(' ')[0]) : gray(this.hint)].join(' '),
    );

    // Print choices
    if (!this.done) {
      this.out.write(
        '\n\n' +
          this.values
            .map((v, i) => {
              let title = this.cursor === i ? cyan(v.title) : v.title;
              let prefix = this.cursor === i ? cyan(figures.pointer) + ' ' : '  ';
              return `${prefix} ${title}`;
            })
            .join('\n'),
      );
    }
  }
}
