<script>
    
    
    
    
  
  

    

    
    export let attributes;
export let fit;
export let position;
export let video;
export let posterImage;
export let autoPlay;
export let muted;
export let controls;
export let loop;
    
    
    

    
    
    

    

    

    
  </script>

  <video {...attributes} preload="none"  style={{
width: '100%',
height: '100%',
...attributes?.style,
objectFit: fit,
objectPosition: position,
// Hack to get object fit to work as expected and
// not have the video overflow
borderRadius: 1
}}  key={video || 'no-src'}  poster={posterImage}  autoPlay={autoPlay}  muted={muted}  controls={controls}  loop={loop} ></video>