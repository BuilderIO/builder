import Button from './Button.svelte';

export default {
	component: Button,
	name: 'Button',
	inputs: [
		{
			name: 'label',
			type: 'string',
			required: true,
			defaultValue: 'Click me'
		},
		{
			name: 'variant',
			type: 'string',
			required: true,
			enum: ['raised', 'text', 'unelevated', 'outlined'],
			defaultValue: 'raised'
		}
	]
};
