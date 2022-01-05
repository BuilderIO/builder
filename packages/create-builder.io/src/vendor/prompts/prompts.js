import * as el from './elements/';
const noop = v => v;

function toPrompt(type, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = new el[type](args);
    const onAbort = opts.onAbort || noop;
    const onSubmit = opts.onSubmit || noop;
    p.on('state', args.onState || noop);
    p.on('submit', x => res(onSubmit(x)));
    p.on('abort', x => rej(onAbort(x)));
  });
}

/**
 * Text prompt
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {function} [args.onState] On state change callback
 * @returns {Promise} Promise with user input
 */
export function text(args) {
  return toPrompt('TextPrompt', args);
}

/**
 * Classic yes/no prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {function} [args.onState] On state change callback
 * @returns {Promise} Promise with user input
 */
export function confirm(args) {
  return toPrompt('ConfirmPrompt', args);
}

/**
 * Interactive select prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
 * @param {number} [args.initial] Index of default value
 * @param {String} [args.hint] Hint to display
 * @param {function} [args.onState] On state change callback
 * @returns {Promise} Promise with user input
 */
export function select(args) {
  return toPrompt('SelectPrompt', args);
}
