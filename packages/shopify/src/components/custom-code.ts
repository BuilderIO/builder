import { component } from '../constants/components';

export const CustomCode = component({
  name: 'Custom Code',
  component: block => {
    const { options } = block.component!;

    return `
      <div class="builder-custom-code">
        ${options.code || ''}
      </div>
    `;
  },
});
