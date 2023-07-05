'use client'
import { BuilderRenderState } from '@/sdk-src/context/types'
import { evaluate } from '@/sdk-src/functions/evaluate'
import { getContent } from '@/sdk-src/functions/get-content'
import { isBrowser } from '@/sdk-src/functions/is-browser'
import { isEditing } from '@/sdk-src/functions/is-editing'
import { isPreviewing } from '@/sdk-src/functions/is-previewing'
import { createRegisterComponentMessage } from '@/sdk-src/functions/register-component'
import { _track } from '@/sdk-src/functions/track'
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '@/sdk-src/scripts/init-editing'
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import {
  BuilderComponentStateChange,
  RenderContentProps,
} from './render-content.types'
import { Breakpoints, BuilderContent } from '@/sdk-src/types/builder-content'
import { logger } from '@/sdk-src/helpers/logger'
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './render-content.helpers'
import BuilderContext from '@/sdk-src/context/builder.context'
import { getInteractionPropertiesForEvent } from '@/sdk-src/functions/track/interaction'
import { TARGET } from '@/sdk-src/constants/target'
import { checkIsDefined } from '@/sdk-src/helpers/nullable'
import { ComponentInfo } from '@/sdk-src/types/components'
import { Dictionary } from '@/sdk-src/types/typescript'

type BuilderEditorProps = Omit<RenderContentProps, 'customComponents'> & {
  customComponents: Dictionary<ComponentInfo>
}

export default function BuilderEditor(
  props: PropsWithChildren<BuilderEditorProps>
) {
  const elementRef = useRef<HTMLDivElement>(null)
  const canTrackToUse = checkIsDefined(props.canTrack) ? props.canTrack : true

  const [clicked, setClicked] = useState(() => false)

  function contentSetState(newRootState: BuilderRenderState) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      rootState: newRootState,
    }))
  }

  const [builderContextSignal, setBuilderContextSignal] = useState(() => ({
    content: getContentInitialValue({
      content: props.content,
      data: props.data,
    }),
    localState: undefined,
    rootState: getContextStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    }),
    rootSetState: contentSetState,
    context: props.context || {},
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    registeredComponents: props.customComponents,
    inheritedStyles: {},
  }))

  const [httpReqsData, setHttpReqsData] = useState(
    () => ({} as Record<string, boolean>)
  )

  function evalExpression(expression: string) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: props.context || {},
        localState: undefined,
        rootState: builderContextSignal.rootState,
        rootSetState: builderContextSignal.rootSetState,
      })
    )
  }

  function handleRequest({ url, key }: { key: string; url: string }) {
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        const newState = {
          ...builderContextSignal.rootState,
          [key]: json,
        }
        builderContextSignal.rootSetState(newState)
        setHttpReqsData({ [key]: json })
      })
      .catch((err) => {
        console.error('error fetching dynamic data', url, err)
      })
  }

  function runHttpRequests() {
    const requests: {
      [key: string]: string
    } = builderContextSignal.content?.data?.httpRequests ?? {}
    Object.entries(requests).forEach(([key, url]) => {
      if (url && (!httpReqsData[key] || isEditing())) {
        const evaluatedUrl = evalExpression(url)
        handleRequest({
          url: evaluatedUrl,
          key,
        })
      }
    })
  }

  function emitStateUpdate() {
    if (isEditing()) {
      window.dispatchEvent(
        new CustomEvent<BuilderComponentStateChange>(
          'builder:component:stateChange',
          {
            detail: {
              state: builderContextSignal.rootState,
              ref: {
                name: props.model,
              },
            },
          }
        )
      )
    }
  }

  function mergeNewContent(newContent: BuilderContent) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      content: {
        ...builderContextSignal.content,
        ...newContent,
        data: {
          ...builderContextSignal.content?.data,
          ...newContent?.data,
        },
        meta: {
          ...builderContextSignal.content?.meta,
          ...newContent?.meta,
          breakpoints:
            newContent?.meta?.breakpoints ||
            builderContextSignal.content?.meta?.breakpoints,
        },
      },
    }))
  }

  function setBreakpoints(breakpoints: Breakpoints) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      content: {
        ...builderContextSignal.content,
        meta: {
          ...builderContextSignal.content?.meta,
          breakpoints,
        },
      },
    }))
  }

  function processMessage(event: MessageEvent) {
    const { data } = event
    if (data) {
      switch (data.type) {
        case 'builder.configureSdk': {
          const messageContent = data.data
          const { breakpoints, contentId } = messageContent
          if (!contentId || contentId !== builderContextSignal.content?.id) {
            return
          }
          if (breakpoints) {
            setBreakpoints(breakpoints)
          }
          break
        }
        case 'builder.contentUpdate': {
          const messageContent = data.data
          const key =
            messageContent.key ||
            messageContent.alias ||
            messageContent.entry ||
            messageContent.modelName
          const contentData = messageContent.data
          if (key === props.model) {
            mergeNewContent(contentData)
          }

          break
        }
        case 'builder.patchUpdates': {
          // TODO
          break
        }
      }
    }
  }

  function evaluateJsCode() {
    // run any dynamic JS code attached to content
    const jsCode = builderContextSignal.content?.data?.jsCode
    if (jsCode) {
      evaluate({
        code: jsCode,
        context: props.context || {},
        localState: undefined,
        rootState: builderContextSignal.rootState,
        rootSetState: builderContextSignal.rootSetState,
      })
    }
  }

  useEffect(() => {
    if (!props.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      )
    }

    if (isBrowser()) {
      if (isEditing()) {
        registerInsertMenu()
        setupBrowserForEditing({
          ...(props.locale
            ? {
                locale: props.locale,
              }
            : {}),
          ...(props.includeRefs
            ? {
                includeRefs: props.includeRefs,
              }
            : {}),
          ...(props.enrich
            ? {
                enrich: props.enrich,
              }
            : {}),
        })
        Object.values(builderContextSignal.registeredComponents).forEach(
          (registeredComponent) => {
            const message = createRegisterComponentMessage(registeredComponent)
            window.parent?.postMessage(message, '*')
          }
        )
        window.addEventListener('message', processMessage)
        window.addEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate
        )
      }
      if (builderContextSignal.content) {
        const variationId = builderContextSignal.content?.testVariationId
        const contentId = builderContextSignal.content?.id
        _track({
          type: 'impression',
          canTrack: canTrackToUse,
          contentId,
          apiKey: props.apiKey,
          variationId: variationId !== contentId ? variationId : undefined,
        })
      }

      // override normal content in preview mode
      if (isPreviewing()) {
        const searchParams = new URL(location.href).searchParams
        const searchParamPreviewModel = searchParams.get('builder.preview')
        const searchParamPreviewId = searchParams.get(
          `builder.preview.${searchParamPreviewModel}`
        )
        const previewApiKey =
          searchParams.get('apiKey') || searchParams.get('builder.space')

        /**
         * Make sure that:
         * - the preview model name is the same as the one we're rendering, since there can be multiple models rendered  *  at the same time, e.g. header/page/footer.  * - the API key is the same, since we don't want to preview content from other organizations.
         * - if there is content, that the preview ID is the same as that of the one we receive.
         *
         * TO-DO: should we only update the state when there is a change?
         **/
        if (
          searchParamPreviewModel === props.model &&
          previewApiKey === props.apiKey &&
          (!props.content || searchParamPreviewId === props.content.id)
        ) {
          getContent({
            model: props.model,
            apiKey: props.apiKey,
            apiVersion: props.apiVersion,
          }).then((content) => {
            if (content) {
              mergeNewContent(content)
            }
          })
        }
      }
      evaluateJsCode()
      runHttpRequests()
      emitStateUpdate()
    }
  }, [])

  useEffect(() => {
    if (props.content) {
      mergeNewContent(props.content)
    }
  }, [props.content])
  useEffect(() => {
    evaluateJsCode()
  }, [
    builderContextSignal.content?.data?.jsCode,
    builderContextSignal.rootState,
  ])
  useEffect(() => {
    runHttpRequests()
  }, [builderContextSignal.content?.data?.httpRequests])
  useEffect(() => {
    emitStateUpdate()
  }, [builderContextSignal.rootState])

  useEffect(() => {
    return () => {
      if (isBrowser()) {
        window.removeEventListener('message', processMessage)
        window.removeEventListener(
          'builder:component:stateChangeListenerActivated',
          emitStateUpdate
        )
      }
    }
  }, [])

  function onClick(event: any) {
    if (builderContextSignal.content) {
      const variationId = builderContextSignal.content?.testVariationId
      const contentId = builderContextSignal.content?.id
      _track({
        type: 'click',
        canTrack: canTrackToUse,
        contentId,
        apiKey: props.apiKey,
        variationId: variationId !== contentId ? variationId : undefined,
        ...getInteractionPropertiesForEvent(event),
        unique: !clicked,
      })
    }
    if (!clicked) {
      setClicked(true)
    }
  }
  return (
    <BuilderContext.Provider value={builderContextSignal}>
      <div
        ref={elementRef}
        onClick={(event) => onClick(event)}
        builder-content-id={builderContextSignal.content?.id}
        builder-model={props.model}
        {...(TARGET === 'reactNative'
          ? {
              dataSet: {
                // currently, we can't set the actual ID here. // we don't need it right now, we just need to identify content divs for testing.
                'builder-content-id': '',
              },
            }
          : {})}
        {...(props.hideContent
          ? {
              hidden: true,
              'aria-hidden': true,
            }
          : {})}
        className={props.classNameProp}
      >
        {builderContextSignal.content ? props.children : null}
      </div>
    </BuilderContext.Provider>
  )
}
