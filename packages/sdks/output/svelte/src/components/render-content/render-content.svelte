<script>
    import { onMount } from 'svelte'
    import { afterUpdate } from 'svelte'
    import { onDestroy } from 'svelte'
    
  import  {  TARGET  }  from '../../constants/target';
import  BuilderContext,  {  }  from '../../context/builder.context';
import  {  evaluate  }  from '../../functions/evaluate';
import  {  convertSearchParamsToQueryObject  ,  getBuilderSearchParams  }  from '../../functions/get-builder-search-params';
import  {  getContent  }  from '../../functions/get-content';
import  {  getFetch  }  from '../../functions/get-fetch';
import  {  isBrowser  }  from '../../functions/is-browser';
import  {  isEditing  }  from '../../functions/is-editing';
import  {  isPreviewing  }  from '../../functions/is-previewing';
import  {  previewingModelName  }  from '../../functions/previewing-model-name';
import  {  track  }  from '../../functions/track';
import  RenderBlocks,  {  }  from '../render-blocks.svelte';
import  RenderContentStyles,  {  }  from './components/render-styles.svelte';

  

    import { getContext, setContext } from "svelte";

    
    export let content;
export let data;
export let model;
export let apiKey;
    
    function processMessage(event) {
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

function evaluateJsCode() {
// run any dynamic JS code attached to content
const jsCode = useContent?.()?.data?.jsCode;

if (jsCode) {
  evaluate({
    code: jsCode,
    context: context(),
    state: contentState()
  });
}
}

function evalExpression(expression) {
return expression.replace(/{{([^}]+)}}/g, (_match, group) => evaluate({
  code: group,
  context: context(),
  state: contentState()
}));
}

function handleRequest({
url,
key
}) {
const fetchAndSetState = async () => {
  const fetch = await getFetch();
  const response = await fetch(url);
  const json = await response.json();
  const newOverrideState = { ...overrideState,
    [key]: json
  };
  overrideState = newOverrideState;
};

fetchAndSetState();
}

function runHttpRequests() {
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

function emitStateUpdate() {
window.dispatchEvent(new CustomEvent('builder:component:stateChange', {
  detail: {
    state: contentState(),
    ref: {
      name: model
    }
  }
}));
}
    $: useContent = () => {
const mergedContent = { ...content,
  ...overrideContent,
  data: { ...content?.data,
    ...data,
    ...overrideContent?.data
  }
};
return mergedContent;
};

$: contentState = () => {
return { ...content?.data?.state,
  ...data,
  ...overrideState
};
};

$: context = () => {
return {};
};

$: httpReqsData = () => {
return {};
};

    
    setContext(BuilderContext.key, { get content() {
return useContent();
}, get state() {
return contentState();
}, get context() {
return context();
}, get apiKey() {
return apiKey;
},});
    let overrideContent = null;
let update = 0;
let overrideState = {};

    onMount(() => { if (isBrowser()) {
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
} });

    afterUpdate(() => { evaluateJsCode(); });afterUpdate(() => { runHttpRequests(); });afterUpdate(() => { emitStateUpdate(); })

    onDestroy(() => { if (isBrowser()) {
window.removeEventListener('message', processMessage);
window.removeEventListener('builder:component:stateChangeListenerActivated', emitStateUpdate);
} });
  </script>

  
{#if useContent() }

    
<div  on:click="{event => track('click', {
contentId: useContent().id
})}"  data-builder-content-id={useContent?.()?.id} >
      

{#if (useContent?.()?.data?.cssCode || useContent?.()?.data?.customFonts?.length) && TARGET !== 'reactNative' }
<RenderContentStyles  cssCode={useContent().data.cssCode}  customFonts={useContent().data.customFonts} ></RenderContentStyles>


{/if}

      
<RenderBlocks  blocks={useContent?.()?.data?.blocks} ></RenderBlocks>

    </div>

  


{/if}