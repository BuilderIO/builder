import { isDeletionKey } from '../src/utils';

describe('isDeletionKey', () => {
  it('flags Backspace and Delete as deletion keys', () => {
    expect(isDeletionKey('Backspace')).toBe(true);
    expect(isDeletionKey('Delete')).toBe(true);
  });

  it('does not flag other keys, so normal typing/navigation is unaffected', () => {
    expect(isDeletionKey('a')).toBe(false);
    expect(isDeletionKey('Enter')).toBe(false);
    expect(isDeletionKey('ArrowLeft')).toBe(false);
    expect(isDeletionKey(' ')).toBe(false);
  });
});
