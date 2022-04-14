<script>
     import { onMount } from 'svelte'
     import { afterUpdate } from 'svelte'
     import { onDestroy } from 'svelte'
     
   import  {  isBrowser  }  from '../../functions/is-browser';
import  BuilderContext,  {  }  from '../../context/builder.context.lite';
import  {  track  }  from '../../functions/track';
import  {  isEditing  }  from '../../functions/is-editing';
import  {  isPreviewing  }  from '../../functions/is-previewing';
import  {  previewingModelName  }  from '../../functions/previewing-model-name';
import  {  getContent  }  from '../../functions/get-content';
import  {  convertSearchParamsToQueryObject  ,  getBuilderSearchParams  }  from '../../functions/get-builder-search-params';
import  RenderBlocks,  {  }  from '../render-blocks.lite';
import  {  evaluate  }  from '../../functions/evaluate';
import  {  getFetch  }  from '../../functions/get-fetch';
import  {  TARGET  }  from '../../constants/target';
import  RenderStyles,  {  }  from './components/render-styles.lite';

   
 

     
     export let content;
export let data;
export let model;
export let apiKey;

     function  processMessage(event: MessageEvent) {
 const {
   data
 } = event;

 if (data) {
   switch (data.type) {
     case 'builder.contentUpdate':
       {
         const messageContent = data.data;
         const key = messageContent.key || messageContent.alias || messageContent.entry || messageContent.modelName;
         const contentData = messageContent.data;

         if (key === model) {
           overrideContent = contentData;
         }

         break;
       }

     case 'builder.patchUpdates':
       {
         // TODO
         break;
       }
   }
 }
}
function  evaluateJsCode() {
 // run any dynamic JS code attached to content
 const jsCode = useContent?.()?.data?.jsCode;

 if (jsCode) {
   evaluate({
     code: jsCode,
     context: context(),
     state: state()
   });
 }
}
function  evalExpression(expression: string) {
 return expression.replace(/{{([^}]+)}}/g, (_match, group) => evaluate({
   code: group,
   context: context(),
   state: state()
 }));
}
function  handleRequest({
 url,
 key
}: {
 key: string;
 url: string;
}) {
 const fetchAndSetState = async () => {
   const response = await getFetch()(url);
   const json = await response.json();
   const newOverrideState = { ...overrideState,
     [key]: json
   };
   overrideState = newOverrideState;
 };

 fetchAndSetState();
}
function  runHttpRequests() {
 const requests = useContent?.()?.data?.httpRequests ?? {};
 Object.entries(requests).forEach(([key, url]) => {
   if (url && (!httpReqsData()[key] || isEditing())) {
     const evaluatedUrl = evalExpression(url);
     handleRequest({
       url: evaluatedUrl,
       key
     });
   }
 });
}
function  emitStateUpdate() {
 window.dispatchEvent(new CustomEvent<BuilderComponentStateChange>('builder:component:stateChange', {
   detail: {
     state: state(),
     ref: {
       name: model
     }
   }
 }));
}

     $:  useContent = () =>  {
 const mergedContent: BuilderContent = { ...content,
   ...overrideContent,
   data: { ...content?.data,
     ...data,
     ...overrideContent?.data
   }
 };
 return mergedContent;
}
$:  state = () =>  {
 return { ...content?.data?.state,
   ...data,
   ...overrideState
 };
}
$:  context = () =>  {
 return ({} as {
   [index: string]: any;
 });
}
$:  httpReqsData = () =>  {
 return {};
}


     let  overrideContent= null
let  update= 0
let  overrideState= {}


     onMount(() => { 
 if (isBrowser()) {
   if (isEditing()) {
     window.addEventListener('message', processMessage);
     window.addEventListener('builder:component:stateChangeListenerActivated', emitStateUpdate);
   }

   if (useContent()) {
     track('impression', {
       contentId: useContent().id
     });
   } // override normal content in preview mode


   if (isPreviewing()) {
     if (model && previewingModelName() === model) {
       const currentUrl = new URL(location.href);
       const previewApiKey = currentUrl.searchParams.get('apiKey');

       if (previewApiKey) {
         getContent({
           model: model,
           apiKey: previewApiKey,
           options: getBuilderSearchParams(convertSearchParamsToQueryObject(currentUrl.searchParams))
         }).then(content => {
           if (content) {
             overrideContent = content;
           }
         });
       }
     }
   }

   evaluateJsCode();
   runHttpRequests();
   emitStateUpdate();
 }
});

     afterUpdate(() => { 
 evaluateJsCode();
});afterUpdate(() => { 
 runHttpRequests();
});afterUpdate(() => { 
 emitStateUpdate();
})

     onDestroy(() => { 
 if (isBrowser()) {
   window.removeEventListener('message', processMessage);
   window.removeEventListener('builder:component:stateChangeListenerActivated', emitStateUpdate);
 }
});
   </script>

   {#if useContent() }
     
<div  on:click="{event => track('click', {
 contentId: useContent().id
})}"  data-builder-content-id={useContent?.()?.id} >
       
{#if (useContent?.()?.data?.cssCode || useContent?.()?.data?.customFonts?.length) && TARGET !== 'reactNative' }<RenderStyles  cssCode={useContent().data.cssCode}  customFonts={useContent().data.customFonts} ></RenderStyles>{/if}

       
<RenderBlocks  blocks={useContent?.()?.data?.blocks} ></RenderBlocks>

     </div>

   {/if}