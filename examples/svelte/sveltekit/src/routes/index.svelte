<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import { page } from '$app/stores';

	import * as BuilderSDK from '@builder.io/sdk-svelte';

	// register native Builder components
	// TO-DO: do this in Svelte SDK
	BuilderSDK.registerComponent(BuilderSDK.Text, {
		name: 'Text',
		static: true,
		builtIn: true,
		image:
			'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929',
		inputs: [
			{
				name: 'text',
				type: 'html',
				required: true,
				autoFocus: true,
				bubble: true,
				defaultValue: 'Enter some text...'
			}
		],
		defaultStyles: {
			lineHeight: 'normal',
			height: 'auto',
			textAlign: 'center'
		}
	});
	BuilderSDK.registerComponent(BuilderSDK.Button, {
		name: 'Core:Button',
		builtIn: true,
		image:
			'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F81a15681c3e74df09677dfc57a615b13',
		defaultStyles: {
			appearance: 'none',
			paddingTop: '15px',
			paddingBottom: '15px',
			paddingLeft: '25px',
			paddingRight: '25px',
			backgroundColor: '#000000',
			color: 'white',
			borderRadius: '4px',
			textAlign: 'center',
			cursor: 'pointer'
		},
		inputs: [
			{ name: 'text', type: 'text', defaultValue: 'Click me!', bubble: true },
			{ name: 'link', type: 'url', bubble: true },
			{
				name: 'openLinkInNewTab',
				type: 'boolean',
				defaultValue: false,
				friendlyName: 'Open link in new tab'
			}
		],
		static: true,
		noWrap: true
	});

	BuilderSDK.registerComponent(BuilderSDK.Columns, {
		name: 'Columns',
		builtIn: true,
		inputs: [
			{
				name: 'columns',
				type: 'array',
				broadcast: true,
				subFields: [
					{
						name: 'blocks',
						type: 'array',
						hideFromUI: true,
						defaultValue: [
							{
								'@type': '@builder.io/sdk:Element',
								responsiveStyles: {
									large: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										flexShrink: '0',
										position: 'relative',
										marginTop: '30px',
										textAlign: 'center',
										lineHeight: 'normal',
										height: 'auto',
										minHeight: '20px',
										minWidth: '20px',
										overflow: 'hidden'
									}
								},
								component: {
									name: 'Image',
									options: {
										image:
											'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
										backgroundPosition: 'center',
										backgroundSize: 'cover',
										aspectRatio: 0.7004048582995948
									}
								}
							},
							{
								'@type': '@builder.io/sdk:Element',
								responsiveStyles: {
									large: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										flexShrink: '0',
										position: 'relative',
										marginTop: '30px',
										textAlign: 'center',
										lineHeight: 'normal',
										height: 'auto'
									}
								},
								component: {
									name: 'Text',
									options: { text: '<p>Enter some text...</p>' }
								}
							}
						]
					},
					{
						name: 'width',
						type: 'number',
						hideFromUI: true,
						helperText: 'Width %, e.g. set to 50 to fill half of the space'
					},
					{
						name: 'link',
						type: 'url',
						helperText: 'Optionally set a url that clicking this column will link to'
					}
				],
				defaultValue: [
					{
						blocks: [
							{
								'@type': '@builder.io/sdk:Element',
								responsiveStyles: {
									large: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										flexShrink: '0',
										position: 'relative',
										marginTop: '30px',
										textAlign: 'center',
										lineHeight: 'normal',
										height: 'auto',
										minHeight: '20px',
										minWidth: '20px',
										overflow: 'hidden'
									}
								},
								component: {
									name: 'Image',
									options: {
										image:
											'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
										backgroundPosition: 'center',
										backgroundSize: 'cover',
										aspectRatio: 0.7004048582995948
									}
								}
							},
							{
								'@type': '@builder.io/sdk:Element',
								responsiveStyles: {
									large: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										flexShrink: '0',
										position: 'relative',
										marginTop: '30px',
										textAlign: 'center',
										lineHeight: 'normal',
										height: 'auto'
									}
								},
								component: {
									name: 'Text',
									options: { text: '<p>Enter some text...</p>' }
								}
							}
						]
					},
					{
						blocks: [
							{
								'@type': '@builder.io/sdk:Element',
								responsiveStyles: {
									large: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										flexShrink: '0',
										position: 'relative',
										marginTop: '30px',
										textAlign: 'center',
										lineHeight: 'normal',
										height: 'auto',
										minHeight: '20px',
										minWidth: '20px',
										overflow: 'hidden'
									}
								},
								component: {
									name: 'Image',
									options: {
										image:
											'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
										backgroundPosition: 'center',
										backgroundSize: 'cover',
										aspectRatio: 0.7004048582995948
									}
								}
							},
							{
								'@type': '@builder.io/sdk:Element',
								responsiveStyles: {
									large: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'stretch',
										flexShrink: '0',
										position: 'relative',
										marginTop: '30px',
										textAlign: 'center',
										lineHeight: 'normal',
										height: 'auto'
									}
								},
								component: {
									name: 'Text',
									options: { text: '<p>Enter some text...</p>' }
								}
							}
						]
					}
				],
				onChange:
					"        function clearWidths() {          columns.forEach(col => {            col.delete('width');          });        }        const columns = options.get('columns') as Array<map<string, any>>;        if (Array.isArray(columns)) {          const containsColumnWithWidth = !!columns.find(col => col.get('width'));          if (containsColumnWithWidth) {            const containsColumnWithoutWidth = !!columns.find(col => !col.get('width'));            if (containsColumnWithoutWidth) {              clearWidths();            } else {              const sumWidths = columns.reduce((memo, col) => {                return memo + col.get('width');              }, 0);              const widthsDontAddUp = sumWidths !== 100;              if (widthsDontAddUp) {                clearWidths();              }            }          }        }      "
			},
			{
				name: 'space',
				type: 'number',
				defaultValue: 20,
				helperText: 'Size of gap between columns',
				advanced: true
			},
			{
				name: 'stackColumnsAt',
				type: 'string',
				defaultValue: 'tablet',
				helperText: 'Convert horizontal columns to vertical at what device size',
				enum: ['tablet', 'mobile', 'never'],
				advanced: true
			},
			{
				name: 'reverseColumnsWhenStacked',
				type: 'boolean',
				defaultValue: false,
				helperText: 'When stacking columns for mobile devices, reverse the ordering',
				advanced: true
			}
		]
	});
	// TODO: enter your public API key
	const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

	// onMounted() {
	//   // we need to re-run this check on the client in case of SSR
	//   this.canShowContent = this.content || isEditing() || isPreviewing();
	// },

	let content = undefined;
	let canShowContent = false;
	const fetch = async () => {
		content = await BuilderSDK.getContent({
			model: 'page',
			apiKey: BUILDER_PUBLIC_API_KEY,
			options: BuilderSDK.getBuilderSearchParams($page.params),
			userAttributes: {
				urlPath: $page.url.pathname
			}
		});
		canShowContent = content || BuilderSDK.isEditing();

		// if (!this.canShowContent) {
		// 	// 404
		// }
	};

	fetch();
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>
		<div class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="Welcome" />
			</picture>
		</div>

		to your new<br />SvelteKit app
	</h1>

	<div>Hello world from your SvelteKit project. Below is Builder Content:</div>

	{#if canShowContent}
		<div>page: {(content && content.data && content.data.title) || 'Unpublished'}</div>
		<BuilderSDK.RenderContent model="page" {content} api-key={BUILDER_PUBLIC_API_KEY} />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
