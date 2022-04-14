<script>
    
    
    
    
  import  RenderBlock,  {  }  from '../components/render-block.lite';

  


    
    export let formRef;
export let previewState;
export let sendWithJs;
export let sendSubmissionsTo;
export let action;
export let customHeaders;
export let contentType;
export let sendSubmissionsToEmail;
export let name;
export let method;
export let errorMessagePath;
export let resetFormOnSubmit;
export let successUrl;
export let validate;
export let attributes;
export let builderBlock;
export let errorMessage;
export let sendingMessage;
export let successMessage;

    function  onSubmit(event: Event & {
currentTarget: HTMLFormElement;
}) {
const sendWithJs = sendWithJs || sendSubmissionsTo === 'email';

if (sendSubmissionsTo === 'zapier') {
  event.preventDefault();
} else if (sendWithJs) {
  if (!(action || sendSubmissionsTo === 'email')) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  const el = event.currentTarget;
  const headers = customHeaders || {};
  let body: any;
  const formData = new FormData(el); // TODO: maybe support null

  const formPairs: {
    key: string;
    value: File | boolean | number | string | FileList;
  }[] = Array.from(event.currentTarget.querySelectorAll('input,select,textarea')).filter(el => !!(el as HTMLInputElement).name).map(el => {
    let value: any;
    const key = (el as HTMLImageElement).name;

    if (el instanceof HTMLInputElement) {
      if (el.type === 'radio') {
        if (el.checked) {
          value = el.name;
          return {
            key,
            value
          };
        }
      } else if (el.type === 'checkbox') {
        value = el.checked;
      } else if (el.type === 'number' || el.type === 'range') {
        const num = el.valueAsNumber;

        if (!isNaN(num)) {
          value = num;
        }
      } else if (el.type === 'file') {
        // TODO: one vs multiple files
        value = el.files;
      } else {
        value = el.value;
      }
    } else {
      value = (el as HTMLInputElement).value;
    }

    return {
      key,
      value
    };
  });
  let contentType = contentType;

  if (sendSubmissionsTo === 'email') {
    contentType = 'multipart/form-data';
  }

  Array.from(formPairs).forEach(({
    value
  }) => {
    if (value instanceof File || Array.isArray(value) && value[0] instanceof File || value instanceof FileList) {
      contentType = 'multipart/form-data';
    }
  }); // TODO: send as urlEncoded or multipart by default
  // because of ease of use and reliability in browser API
  // for encoding the form?

  if (contentType !== 'application/json') {
    body = formData;
  } else {
    // Json
    const json = {};
    Array.from(formPairs).forEach(({
      value,
      key
    }) => {
      set(json, key, value);
    });
    body = JSON.stringify(json);
  }

  if (contentType && contentType !== 'multipart/form-data') {
    if (
    /* Zapier doesn't allow content-type header to be sent from browsers */
    !(sendWithJs && action?.includes('zapier.com'))) {
      headers['content-type'] = contentType;
    }
  }

  const presubmitEvent = new CustomEvent('presubmit', {
    detail: {
      body
    }
  });

  if (formRef) {
    formRef.dispatchEvent(presubmitEvent);

    if (presubmitEvent.defaultPrevented) {
      return;
    }
  }

  state = 'sending';
  const formUrl = `${builder.env === 'dev' ? 'http://localhost:5000' : 'https://builder.io'}/api/v1/form-submit?apiKey=${builder.apiKey}&to=${btoa(sendSubmissionsToEmail || '')}&name=${encodeURIComponent(name || '')}`;
  fetch(sendSubmissionsTo === 'email' ? formUrl : action!
  /* TODO: throw error if no action URL */
  , {
    body,
    headers,
    method: method || 'post'
  }).then(async res => {
    let body;
    const contentType = res.headers.get('content-type');

    if (contentType && contentType.indexOf('application/json') !== -1) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok && errorMessagePath) {
      /* TODO: allow supplying an error formatter function */
      let message = get(body, errorMessagePath);

      if (message) {
        if (typeof message !== 'string') {
          /* TODO: ideally convert json to yaml so it woul dbe like
           error: - email has been taken */
          message = JSON.stringify(message);
        }

        formErrorMessage = message;
      }
    }

    responseData = body;
    state = res.ok ? 'success' : 'error';

    if (res.ok) {
      const submitSuccessEvent = new CustomEvent('submit:success', {
        detail: {
          res,
          body
        }
      });

      if (formRef) {
        formRef.dispatchEvent(submitSuccessEvent);

        if (submitSuccessEvent.defaultPrevented) {
          return;
        }
        /* TODO: option to turn this on/off? */


        if (resetFormOnSubmit !== false) {
          formRef.reset();
        }
      }
      /* TODO: client side route event first that can be preventDefaulted */


      if (successUrl) {
        if (formRef) {
          const event = new CustomEvent('route', {
            detail: {
              url: successUrl
            }
          });
          formRef.dispatchEvent(event);

          if (!event.defaultPrevented) {
            location.href = successUrl;
          }
        } else {
          location.href = successUrl;
        }
      }
    }
  }, err => {
    const submitErrorEvent = new CustomEvent('submit:error', {
      detail: {
        error: err
      }
    });

    if (formRef) {
      formRef.dispatchEvent(submitErrorEvent);

      if (submitErrorEvent.defaultPrevented) {
        return;
      }
    }

    responseData = err;
    state = 'error';
  });
}
}

    $:  submissionState = () =>  {
return Builder.isEditing && previewState || state;
}


    let  state= 'unsubmitted'
let  responseData= null
let  formErrorMessage= ''


    

    

    
  </script>

  <form {...attributes} validate={validate}  bind:this={formRef}  action={!sendWithJs && action}  method={method}  name={name}  on:submit="{event => onSubmit(event)}" >
    
{#if builderBlock && builderBlock.children }
      
{#each builderBlock?.children as block }<RenderBlock  block={block} ></RenderBlock>{/each}

    {/if}


    
{#if submissionState() === 'error' }
      
<BuilderBlocks  dataPath="errorMessage"  blocks={errorMessage} ></BuilderBlocks>

    {/if}


    
{#if submissionState() === 'sending' }
      
<BuilderBlocks  dataPath="sendingMessage"  blocks={sendingMessage} ></BuilderBlocks>

    {/if}


    
{#if submissionState() === 'error' && responseData }
      
<pre  class="builder-form-error-text pre" >
        
{JSON.stringify(responseData, null, 2)}

      </pre>

    {/if}


    
{#if submissionState() === 'success' }
      
<BuilderBlocks  dataPath="successMessage"  blocks={successMessage} ></BuilderBlocks>

    {/if}

  </form>

  <style>
    .pre { 
padding: 10px;
color: red;
text-align: center; }
  </style>