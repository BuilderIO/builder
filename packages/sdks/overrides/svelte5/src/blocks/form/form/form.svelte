<script lang="ts">
  import type { Snippet } from 'svelte';
  import Blocks from '../../../components/blocks/blocks.svelte';
  import { getEnv } from '../../../functions/get-env.js';
  import { get } from '../../../functions/get.js';
  import { isEditing } from '../../../functions/is-editing.js';
  import { logFetch } from '../../../functions/log-fetch.js';
  import { set } from '../../../functions/set.js';
  import type { BuilderBlock } from '../../../types/builder-block.js';
  import type {
    BuilderComponentsProp,
    BuilderDataProps,
    BuilderLinkComponentProp,
  } from '../../../types/builder-props.js';
  import type { Dictionary } from '../../../types/typescript.js';

  type FormState = 'unsubmitted' | 'sending' | 'success' | 'error';

  type FormProps = BuilderDataProps &
    BuilderComponentsProp &
    BuilderLinkComponentProp & {
      attributes?: any;
      name?: string;
      action?: string;
      validate?: boolean;
      method?: string;
      sendSubmissionsTo?: string;
      sendSubmissionsToEmail?: string;
      sendWithJs?: boolean;
      contentType?: string;
      customHeaders?: { [key: string]: string };
      successUrl?: string;
      previewState?: FormState;
      successMessage?: BuilderBlock[];
      errorMessage?: BuilderBlock[];
      sendingMessage?: BuilderBlock[];
      resetFormOnSubmit?: boolean;
      errorMessagePath?: string;
      children?: Snippet;
    };

  let {
    attributes,
    name,
    action,
    validate,
    method,
    sendSubmissionsTo,
    sendSubmissionsToEmail,
    sendWithJs,
    contentType,
    customHeaders,
    successUrl,
    previewState,
    successMessage,
    errorMessage,
    sendingMessage,
    resetFormOnSubmit,
    errorMessagePath,
    builderContext,
    children,
  }: FormProps = $props();

  let formRef = $state<HTMLFormElement>();
  let formState = $state<FormState>('unsubmitted');
  // TODO: separate response and error?
  let responseData = $state<any>(null);
  let formErrorMessage = $state('');

  function mergeNewRootState(newData: Dictionary<any>) {
    const combinedState = {
      ...builderContext.rootState,
      ...newData,
    };

    if (builderContext.rootSetState) {
      builderContext.rootSetState?.(combinedState);
    } else {
      builderContext.rootState = combinedState;
    }
  }

  const submissionState = $derived<FormState>((isEditing() && previewState) || formState);

  const errorResponse = (response: any) => JSON.stringify(response, null, 2);

  function onSubmit(event: any) {
    const sendWithJsProp = sendWithJs || sendSubmissionsTo === 'email';

    if (sendSubmissionsTo === 'zapier') {
      event.preventDefault();
    } else if (sendWithJsProp) {
      if (!(action || sendSubmissionsTo === 'email')) {
        event.preventDefault();
        return;
      }
      event.preventDefault();

      const el = event.currentTarget || event.target;
      const headers = customHeaders || {};

      let body: any;

      const formData = new FormData(el);

      // TODO: maybe support null
      const formPairs: {
        key: string;
        value: File | boolean | number | string | FileList;
      }[] = Array.from(el.querySelectorAll('input,select,textarea'))
        .filter((el) => !!(el as HTMLInputElement).name)
        .filter(
          (el) =>
            !!(el as HTMLInputElement).name &&
            ((el as HTMLInputElement).type !== 'radio' || (el as HTMLInputElement).checked)
        )
        .map((el) => {
          let value: any;
          const key = (el as HTMLImageElement).name;
          if (el instanceof HTMLInputElement) {
            if (el.type === 'radio') {
              if (el.checked) {
                value = el.value;
                return { key, value };
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

          return { key, value };
        });

      let formContentType = contentType;

      if (sendSubmissionsTo === 'email') {
        formContentType = 'multipart/form-data';
      }

      Array.from(formPairs).forEach(({ value }) => {
        if (
          value instanceof File ||
          (Array.isArray(value) && value[0] instanceof File) ||
          value instanceof FileList
        ) {
          formContentType = 'multipart/form-data';
        }
      });

      // TODO: send as urlEncoded or multipart by default
      // because of ease of use and reliability in browser API
      // for encoding the form?
      if (formContentType !== 'application/json') {
        body = formData;
      } else {
        // Json
        const json = {};

        Array.from(formPairs).forEach(({ value, key }) => {
          set(json, key, value);
        });

        body = JSON.stringify(json);
      }

      if (formContentType && formContentType !== 'multipart/form-data') {
        if (
          /* Zapier doesn't allow content-type header to be sent from browsers */
          !(sendWithJsProp && action?.includes('zapier.com'))
        ) {
          headers['content-type'] = formContentType;
        }
      }

      const presubmitEvent = new CustomEvent('presubmit', {
        detail: {
          body,
        },
      });
      if (formRef) {
        formRef.dispatchEvent(presubmitEvent);
        if (presubmitEvent.defaultPrevented) {
          return;
        }
      }

      formState = 'sending';

      if (
        sendSubmissionsTo === 'email' &&
        (sendSubmissionsToEmail === 'your@email.com' || !sendSubmissionsToEmail)
      ) {
        const message = 'SubmissionsToEmail is required when sendSubmissionsTo is set to email';
        console.error(message);
        formState = 'error';
        mergeNewRootState({
          formErrorMessage: message,
        });
        return;
      }

      const formUrl = `${
        getEnv() === 'dev' ? 'http://localhost:5000' : 'https://builder.io'
      }/api/v1/form-submit?apiKey=${builderContext.apiKey}&to=${btoa(
        sendSubmissionsToEmail || ''
      )}&name=${encodeURIComponent(name || '')}`;

      const url =
        sendSubmissionsTo === 'email' ? formUrl : action!; /* TODO: throw error if no action URL */

      logFetch(url);

      fetch(url, {
        body,
        headers,
        method: method || 'post',
      }).then(
        async (res) => {
          let body;
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') !== -1) {
            body = await res.json();
          } else {
            body = await res.text();
          }

          if (!res.ok) {
            const submitErrorEvent = new CustomEvent('submit:error', {
              detail: {
                error: body,
                status: res.status,
              },
            });

            // `nativeElement` is Angular's ElementRef; kept as in the source (never set here).
            if ((formRef as any)?.nativeElement) {
              (formRef as any)?.nativeElement.dispatchEvent(submitErrorEvent);
              if (submitErrorEvent.defaultPrevented) {
                return;
              }
            }
            responseData = body;
            formState = 'error';

            let message = errorMessagePath
              ? get(body, errorMessagePath)
              : body.message || body.error || body;

            if (typeof message !== 'string') {
              message = JSON.stringify(message);
            }

            formErrorMessage = message;
            mergeNewRootState({
              formErrorMessage: message,
            });

            return;
          }

          responseData = body;
          formState = res.ok ? 'success' : 'error';

          if (res.ok) {
            const submitSuccessEvent = new CustomEvent('submit:success', {
              detail: {
                res,
                body,
              },
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
                    url: successUrl,
                  },
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
        },
        (err) => {
          const submitErrorEvent = new CustomEvent('submit:error', {
            detail: {
              error: err,
            },
          });
          if (formRef) {
            formRef.dispatchEvent(submitErrorEvent);
            if (submitErrorEvent.defaultPrevented) {
              return;
            }
          }

          responseData = err;
          formState = 'error';
        }
      );
    }
  }

  // The block's own `onsubmit` action (if any) runs too, as with the Svelte 4 `use:` listeners.
  function handleSubmit(event: SubmitEvent) {
    onSubmit(event);
    attributes?.onsubmit?.(event);
  }

  // Through a spread: `validate` is not a typed `<form>` attribute, and `action` can be `false`.
  const formAttrs = $derived({ validate, action: !sendWithJs && action });
</script>

<form
  {...formAttrs}
  bind:this={formRef}
  {method}
  {name}
  {...attributes}
  onsubmit={handleSubmit}
>
  {@render children?.()}

  {#if submissionState === 'error'}
    <Blocks path="errorMessage" blocks={errorMessage!} context={builderContext} />
  {/if}

  {#if submissionState === 'sending'}
    <Blocks path="sendingMessage" blocks={sendingMessage!} context={builderContext} />
  {/if}

  {#if submissionState === 'error' && responseData}
    <pre class="builder-form-error-text pre">{errorResponse(responseData)}</pre>
  {/if}

  {#if submissionState === 'success'}
    <Blocks path="successMessage" blocks={successMessage!} context={builderContext} />
  {/if}
</form>

<style>
  .pre {
    padding: 10px;
    color: red;
    text-align: center;
  }
</style>
