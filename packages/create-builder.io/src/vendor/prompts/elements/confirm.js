import { bold, green, gray } from 'colorette';
import { Prompt } from './prompt';
import { style } from '../util';
import { erase, cursor } from 'sisteransi';

/**
 * ConfirmPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Boolean} [opts.initial] Default value (true/false)
 */
export class ConfirmPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.value = opts.initial;
    this.initialValue = !!opts.initial;
    this.render(true);
  }

  reset() {
    this.value = this.initialValue;
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
    this.value = this.value || false;
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  _(c, key) {
    if (c.toLowerCase() === 'y') {
      this.value = true;
      return this.submit();
    }
    if (c.toLowerCase() === 'n') {
      this.value = false;
      return this.submit();
    }
    return this.bell();
  }

  render(first) {
    if (first) this.out.write(cursor.hide);
    if (this.done && this.value) {
      this.out.write(erase.line);
    } else {
      this.out.write(
        erase.line +
          cursor.to(0) +
          [
            style.symbol(this.done, this.aborted),
            this.msg,
            style.delimiter(false),
            this.done
              ? green(this.value ? 'yes' : 'no')
              : gray(this.initialValue ? '(Y/n)' : '(y/N)'),
          ].join(' ')
      );
    }
  }
}
