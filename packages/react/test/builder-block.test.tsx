jest.mock(
  'src/functions/extract-localized-values',
  () => ({ containsLocalizedValues: () => false, extractLocalizedValues: () => ({}) }),
  { virtual: true }
);

import { Builder } from '@builder.io/sdk';
import { BuilderBlock } from '../src/components/builder-block.component';

describe('BuilderBlock', () => {
  test('ignores messages from untrusted origins', () => {
    const block = new BuilderBlock({ block: { id: 'block-id' } as any });
    const event = {
      origin: 'https://evil-builder.io.attacker.com',
      data: {
        type: 'builder.patchUpdates',
        data: { data: { 'block-id': [{ op: 'add', path: '/bindings/x', value: 'alert(1)' }] } },
      },
    } as MessageEvent;
    const trustedHostSpy = jest.spyOn(Builder, 'isTrustedHostForEvent').mockReturnValue(false);
    const setStateSpy = jest.spyOn(block, 'setState');

    block.onWindowMessage(event);

    expect(trustedHostSpy).toHaveBeenCalledWith(event);
    expect(setStateSpy).not.toHaveBeenCalled();
  });
});
