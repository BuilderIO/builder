'use client'
import * as React from 'react'
import { useState, useContext, useRef, useEffect } from 'react'
import { getDefaultRegisteredComponents } from '../../constants/builder-registered-components'
import type {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types'
import { evaluate } from '../../functions/evaluate'
import { getContent } from '../../functions/get-content/index'
import { fetch } from '../../functions/get-fetch'
import { isBrowser } from '../../functions/is-browser'
import { isEditing } from '../../functions/is-editing'
import { isPreviewing } from '../../functions/is-previewing'
import {
  components,
  createRegisterComponentMessage,
} from '../../functions/register-component'
import { _track } from '../../functions/track/index'
import type { Breakpoints, BuilderContent } from '../../types/builder-content'
import type { Nullable } from '../../types/typescript'
import RenderBlocks from '../render-blocks'
import RenderContentStyles from './components/render-styles'
import builderContext from '../../context/builder.context'
import {
  registerInsertMenu,
  setupBrowserForEditing,
} from '../../scripts/init-editing'
import { checkIsDefined } from '../../helpers/nullable'
import { getInteractionPropertiesForEvent } from '../../functions/track/interaction'
import type {
  RenderContentProps,
  BuilderComponentStateChange,
} from './render-content.types'
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './render-content.helpers'
import { TARGET } from '../../constants/target'
import { logger } from '../../helpers/logger'
import { getRenderContentScriptString } from '../render-content-variants/helpers'
import { wrapComponentRef } from './wrap-component-ref'

function RenderContent(props: RenderContentProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [forceReRenderCount, setForceReRenderCount] = useState(() => 0)

  const [overrideContent, setOverrideContent] = useState(() => null)

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

  const [update, setUpdate] = useState(() => 0)

  const [canTrackToUse, setCanTrackToUse] = useState(() =>
    checkIsDefined(props.canTrack) ? props.canTrack : true
  )

  function contentSetState(newRootState: BuilderRenderState) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      rootState: newRootState,
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
          setForceReRenderCount(forceReRenderCount + 1) // This is a hack to force Qwik to re-render.
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
            setForceReRenderCount(forceReRenderCount + 1) // This is a hack to force Qwik to re-render.
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
        rootSetState: contentSetState,
      })
    }
  }

  const [httpReqsData, setHttpReqsData] = useState(() => ({}))

  const [clicked, setClicked] = useState(() => false)

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

  function evalExpression(expression: string) {
    return expression.replace(/{{([^}]+)}}/g, (_match, group) =>
      evaluate({
        code: group,
        context: props.context || {},
        localState: undefined,
        rootState: builderContextSignal.rootState,
        rootSetState: contentSetState,
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
        contentSetState(newState)
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

  const [scriptStr, setScriptStr] = useState(() =>
    getRenderContentScriptString({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id!,
      parentContentId: props.parentContentId!,
    })
  )

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
    registeredComponents: [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce(
      (acc, { component, ...curr }) => ({
        ...acc,
        [curr.name]: {
          component:
            TARGET === 'vue3' ? wrapComponentRef(component) : component,
          ...curr,
        },
      }),
      {} as RegisteredComponents
    ),
    inheritedStyles: {},
  }))

  useEffect(() => {
    if (!props.apiKey) {
      logger.error(
        'No API key provided to `RenderContent` component. This can cause issues. Please provide an API key using the `apiKey` prop.'
      )
    }
    if (isBrowser()) {
      if (isEditing()) {
        setForceReRenderCount(forceReRenderCount + 1)
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
        Object.values<RegisteredComponent>(
          builderContextSignal.registeredComponents
        ).forEach((registeredComponent) => {
          const message = createRegisterComponentMessage(registeredComponent)
          window.parent?.postMessage(message, '*')
        })
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

  return (
    <builderContext.Provider value={builderContextSignal}>
      {builderContextSignal.content ? (
        <>
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
            {props.isSsrAbTest ? (
              <>
                <script dangerouslySetInnerHTML={{ __html: scriptStr }} />
              </>
            ) : null}

            {TARGET !== 'reactNative' ? (
              <>
                <RenderContentStyles
                  contentId={builderContextSignal.content?.id}
                  cssCode={builderContextSignal.content?.data?.cssCode}
                  customFonts={builderContextSignal.content?.data?.customFonts}
                />
              </>
            ) : null}

            <RenderBlocks
              blocks={builderContextSignal.content?.data?.blocks}
              key={forceReRenderCount}
            />
          </div>
        </>
      ) : null}
    </builderContext.Provider>
  )
}

export default RenderContent
