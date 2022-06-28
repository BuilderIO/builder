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
		},
		{
			name: 'children',
			type: 'blocks',
			hideFromUI: true,
			defaultValue: [
				{
					'@type': '@builder.io/sdk:Element',
					component: {
						name: 'Text',
						options: {
							text: 'this is editable within builder '
						}
					},
					responsiveStyles: {
						large: {
							display: 'flex',
							flexDirection: 'column',
							position: 'relative',
							flexShrink: '0',
							boxSizing: 'border-box',
							marginTop: '8px',
							lineHeight: 'normal',
							height: 'auto',
							textAlign: 'center'
						}
					}
				}
			]
		}
	]
};
