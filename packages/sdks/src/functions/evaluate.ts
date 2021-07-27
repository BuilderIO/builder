import { isBrowser } from './is-browser';
import { isEditing } from './is-editing';

export function evaluate(options: { code: string; state: any; context: any; event?: Event }): any {
  const builder = {
    isEditing: isEditing(),
    isBrowser: isBrowser(),
  };

  try {
    return new Function(
      'builder',
      'Builder' /* <- legacy */,
      'state',
      'context',
      'event',
      options.code
    )(builder, builder, options.state, options.context, options.event);
  } catch (e) {
    console.warn('Builder custom code error', e);
  }
}
