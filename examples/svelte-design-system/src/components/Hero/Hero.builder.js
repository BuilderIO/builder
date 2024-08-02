import Hero from './Hero.svelte';

export default {
	component: Hero,
	name: 'Hero',
	image:
		'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fd6d3bc814ffd47b182ec8345cc5438c0',
	inputs: [
		{
			name: 'title',
			type: 'richText',
			defaultValue: '<h1>Hero Title</h1>'
		},
		{
			name: 'image',
			type: 'file',
			allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
			required: true,
			defaultValue:
				'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F52dcecf48f9c48cc8ddd8f81fec63236'
		},
		{
			name: 'buttonLink',
			type: 'string',
			defaultValue: 'https://example.com'
		},
		{
			name: 'height',
			type: 'number',
			defaultValue: 400
		}
	]
};
