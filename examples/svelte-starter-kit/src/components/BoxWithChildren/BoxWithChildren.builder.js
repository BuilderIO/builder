import BoxWithChildren from './BoxWithChildren.svelte';

export default {
	component: BoxWithChildren,
	name: 'BoxWithChildren',
	canHaveChildren: true,
	inputs: [
		{
			name: 'textBefore',
			type: 'string',
			defaultValue: 'Simple text before children'
		},
		{
			name: 'textAfter',
			type: 'string',
			defaultValue: 'Simple text after children'
		}
	]
};
