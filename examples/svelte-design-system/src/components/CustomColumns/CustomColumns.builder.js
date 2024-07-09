import CustomColumns from './CustomColumns.svelte';

export default {
	component: CustomColumns,
	name: 'Custom Columns',
	image:
		'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd3fad4746b794e59a7bc6ba502ec4f44',
	description: 'Example of a custom column with editing regions',
	inputs: [
		{
			name: 'columnsSize',
			type: 'string',
			required: true,
			enum: ['1', '2', '3', '4'],
			defaultValue: '3'
		},
		{
			name: 'columns',
			type: 'array',
			defaultValue: [
				{
					image:
						'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
					blocks: [
						{
							'@type': '@builder.io/sdk:Element',
							component: {
								name: 'Text',
								options: {
									text: 'Enter some text...'
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
				},
				{
					image:
						'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
					blocks: [
						{
							'@type': '@builder.io/sdk:Element',
							component: {
								name: 'Text',
								options: {
									text: 'Enter some text...'
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
			],
			subFields: [
				{
					name: 'image',
					type: 'file',
					allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
					required: true,
					defaultValue:
						'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d'
				},
				{
					name: 'blocks',
					type: 'blocks',
					hideFromUI: true,
					helperText: 'This is an editable region where you can drag and drop blocks.',
					defaultValue: [
						{
							'@type': '@builder.io/sdk:Element',
							component: {
								name: 'Text',
								options: {
									text: 'Enter some text...'
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
		}
	]
};
