<script>

	import { Parallax, ParallaxLayer } from 'svelte-parallax'
	import Button from '../Button/Button.svelte'
	
	let parallax
	export let title = ''
	export let height = 400
	export let buttonLabel = 'click me!'
	export let image = ''
	export let buttonLink = ''
</script>


<Parallax sections={4} bind:this={parallax} style="height: {height + 100}px;">
  <ParallaxLayer 
	  rate={1}
		style="
			background-image: url('{image}');
			background-repeat: no-repeat;
  		background-attachment: fixed;
  		background-position: center;
			background-size: cover;
			display: flex; 
			justify-content: center; 
			align-items: center; 
			flex-direction: column;
		"
	>
	
		<h1>
			{@html title}
		</h1>
		<Button
			variant="raised"
			label={buttonLabel}
			link={buttonLink}
		>
		</Button>
    
  </ParallaxLayer>
</Parallax>

<div style="height: 6rem" />

