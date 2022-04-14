<script>
     import { onMount } from 'svelte'
     
     
     
   
   
 

     
     export let elem;
export let replaceNodes;
export let code;

     function  findAndRunScripts() {
 // TODO: Move this function to standalone one in '@builder.io/utils'
 if (elem && typeof window !== 'undefined') {
   /** @type {HTMLScriptElement[]} */
   const scripts = elem.getElementsByTagName('script');

   for (let i = 0; i < scripts.length; i++) {
     const script = scripts[i];

     if (script.src) {
       if (scriptsInserted.includes(script.src)) {
         continue;
       }

       scriptsInserted.push(script.src);
       const newScript = document.createElement('script');
       newScript.async = true;
       newScript.src = script.src;
       document.head.appendChild(newScript);
     } else if (!script.type || ['text/javascript', 'application/javascript', 'application/ecmascript'].includes(script.type)) {
       if (scriptsRun.includes(script.innerText)) {
         continue;
       }

       try {
         scriptsRun.push(script.innerText);
         new Function(script.innerText)();
       } catch (error) {
         console.warn('`CustomCode`: Error running script:', error);
       }
     }
   }
 }
}

     

     let  scriptsInserted= []
let  scriptsRun= []


     onMount(() => { 
 findAndRunScripts();
});

     

     
   </script>

   <div  bind:this={elem}  class={'builder-custom-code' + (replaceNodes ? ' replace-nodes' : '')} >{@html code}</div>