import {
  For,
  Show,
  useMetadata,
  useRef,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import Block from '../../../components/block/block.lite.jsx';
import Blocks from '../../../components/blocks/blocks.lite.jsx';

import { getEnv } from '../../../functions/get-env.js';
import { get } from '../../../functions/get.js';
import { isEditing } from '../../../functions/is-editing.js';
import { set } from '../../../functions/set.js';
import type { BuilderBlock } from '../../../types/builder-block.js';
import type {
  BuilderComponentsProp,
  BuilderDataProps,
  BuilderLinkComponentProp,
} from '../../../types/builder-props.js';
import type { Dictionary } from '../../../types/typescript.js';
import { filterAttrs } from '../../helpers.js';
/**
 * This import is used by the Svelte SDK. Do not remove.
 */
import { setAttrs } from '../../helpers.js';

export type FormProps = BuilderDataProps &
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
  };

export type FormState = 'unsubmitted' | 'sending' | 'success' | 'error';

useMetadata({
  rsc: {
    componentType: 'client',
  },
});

export default function FormComponent(props: FormProps) {
  const state = useStore({
    formState: 'unsubmitted' as FormState,
    // TODO: separate response and error?
    responseData: null as any,
    formErrorMessage: '',
    mergeNewRootState(newData: Dictionary<any>) {
      const combinedState = {
        ...props.builderContext.value.rootState,
        ...newData,
      };

      if (props.builderContext.value.rootSetState) {
        props.builderContext.value.rootSetState?.(combinedState);
      } else {
        props.builderContext.value.rootState = combinedState;
      }
    },
    submissionState(): FormState {
      return (isEditing() && props.previewState) || state.formState;
    },
    onSubmit(event: any) {
      const sendWithJsProp =
        props.sendWithJs || props.sendSubmissionsTo === 'email';

      if (props.sendSubmissionsTo === 'zapier') {
        event.preventDefault();
      } else if (sendWithJsProp) {
        if (!(props.action || props.sendSubmissionsTo === 'email')) {
          event.preventDefault();
          return;
        }
        event.preventDefault();

        const el = event.currentTarget || event.target;
        const headers = props.customHeaders || {};

        let body: any;

        const formData = new FormData(el);

        // TODO: maybe support null
        const formPairs: {
          key: string;
          value: File | boolean | number | string | FileList;
        }[] = Array.from(el.querySelectorAll('input,select,textarea'))
          .filter((el) => !!(el as HTMLInputElement).name)
          .map((el) => {
            let value: any;
            const key = (el as HTMLImageElement).name;
            if (el instanceof HTMLInputElement) {
              if (el.type === 'radio') {
                if (el.checked) {
                  value = el.name;
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

        let formContentType = props.contentType;

        if (props.sendSubmissionsTo === 'email') {
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
            !(sendWithJsProp && props.action?.includes('zapier.com'))
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

        state.formState = 'sending';

        const formUrl = `${
          getEnv() === 'dev' ? 'http://localhost:5000' : 'https://builder.io'
        }/api/v1/form-submit?apiKey=${props.builderContext.value.apiKey}&to=${btoa(
          props.sendSubmissionsToEmail || ''
        )}&name=${encodeURIComponent(props.name || '')}`;

        fetch(
          props.sendSubmissionsTo === 'email'
            ? formUrl
            : props.action! /* TODO: throw error if no action URL */,
          {
            body,
            headers,
            method: props.method || 'post',
          }
        ).then(
          async (res) => {
            let body;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
              body = await res.json();
            } else {
              body = await res.text();
            }

            if (!res.ok && props.errorMessagePath) {
              /* TODO: allow supplying an error formatter function */
              let message = get(body, props.errorMessagePath);

              if (message) {
                if (typeof message !== 'string') {
                  /* TODO: ideally convert json to yaml so it woul dbe like
                   error: - email has been taken */
                  message = JSON.stringify(message);
                }
                state.formErrorMessage = message;
                state.mergeNewRootState({
                  formErrorMessage: message,
                });
              }
            }

            state.responseData = body;
            state.formState = res.ok ? 'success' : 'error';

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
                if (props.resetFormOnSubmit !== false) {
                  formRef.reset();
                }
              }

              /* TODO: client side route event first that can be preventDefaulted */
              if (props.successUrl) {
                if (formRef) {
                  const event = new CustomEvent('route', {
                    detail: {
                      url: props.successUrl,
                    },
                  });
                  formRef.dispatchEvent(event);
                  if (!event.defaultPrevented) {
                    location.href = props.successUrl;
                  }
                } else {
                  location.href = props.successUrl;
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

            state.responseData = err;
            state.formState = 'error';
          }
        );
      }
    },
  });

  const formRef = useRef<HTMLFormElement>();

  return (
    <form
      validate={props.validate}
      ref={formRef}
      action={!props.sendWithJs && props.action}
      method={props.method}
      name={props.name}
      onSubmit={(event) => state.onSubmit(event)}
      {...useTarget({
        qwik: {
          'preventdefault:submit': true,
        },
        default: {},
      })}
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', false),
        svelte: filterAttrs(props.attributes, 'on:', false),
        default: {},
      })}
      {...useTarget({
        vue: filterAttrs(props.attributes, 'v-on:', true),
        svelte: filterAttrs(props.attributes, 'on:', true),
        default: props.attributes,
      })}
    >
      <Show when={props.builderBlock && props.builderBlock.children}>
        <For each={props.builderBlock?.children}>
          {(block, idx) => (
            <Block
              key={`form-block-${idx}`}
              block={block}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
            />
          )}
        </For>
      </Show>

      <Show when={state.submissionState() === 'error'}>
        <Blocks
          path="errorMessage"
          blocks={props.errorMessage!}
          context={props.builderContext}
        />
      </Show>

      <Show when={state.submissionState() === 'sending'}>
        <Blocks
          path="sendingMessage"
          blocks={props.sendingMessage!}
          context={props.builderContext}
        />
      </Show>

      <Show when={state.submissionState() === 'error' && state.responseData}>
        <pre
          class="builder-form-error-text"
          css={{ padding: '10px', color: 'red', textAlign: 'center' }}
        >
          {JSON.stringify(state.responseData, null, 2)}
        </pre>
      </Show>

      <Show when={state.submissionState() === 'success'}>
        <Blocks
          path="successMessage"
          blocks={props.successMessage!}
          context={props.builderContext}
        />
      </Show>
    </form>
  );
}
