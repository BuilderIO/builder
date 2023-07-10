'use client'
import { evaluate } from '@/sdk-src/functions/evaluate'
import { isBrowser } from '@/sdk-src/functions/is-browser'
import { isEditing } from '@/sdk-src/functions/is-editing'
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
import { BuilderContent } from '@/sdk-src/types/builder-content'
import { logger } from '@/sdk-src/helpers/logger'
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from './render-content.helpers'
import { getInteractionPropertiesForEvent } from '@/sdk-src/functions/track/interaction'
import { TARGET } from '@/sdk-src/constants/target'
import { checkIsDefined } from '@/sdk-src/helpers/nullable'
import { ComponentInfo } from '@/sdk-src/types/components'
import { Dictionary } from '@/sdk-src/types/typescript'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type BuilderEditorProps = Omit<RenderContentProps, 'customComponents'> & {
  customComponents: Dictionary<ComponentInfo>
}

export default function BuilderEditor(
  props: PropsWithChildren<BuilderEditorProps>
) {
  const elementRef = useRef<HTMLDivElement>(null)
  const canTrackToUse = checkIsDefined(props.canTrack) ? props.canTrack : true

  const [clicked, setClicked] = useState(() => false)

  const builderContextSignal = {
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
    rootSetState: undefined,
    context: props.context || {},
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    registeredComponents: props.customComponents,
    inheritedStyles: {},
  }

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
        // builderContextSignal.rootSetState(newState)
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

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function mergeNewContent(newContent: BuilderContent) {
    const newContentStr = encodeURIComponent(JSON.stringify(newContent))
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('builder.patch', newContentStr)

    const newUrl = `${pathname}?${newParams.toString()}`

    router.replace(newUrl)
  }

  const [lastUpdated, setLastUpdated] = useState(0)

  const [shouldSendResetCookie, setShouldSendResetCookie] = useState(false)

  useEffect(() => {
    if (!props.content) return

    const lastUpdatedAutosave = props.content.meta?.lastUpdatedAutosave

    const hardResetCookie = document.cookie
      .split(';')
      .find((x) => x.trim().startsWith('builder.hardReset'))
    const hardResetCookieValue = hardResetCookie?.split('=')[1]

    if (!hardResetCookieValue) return

    if (
      lastUpdatedAutosave &&
      parseInt(hardResetCookieValue) <= lastUpdatedAutosave
    ) {
      console.log('got fresh content! 🎉')
      document.cookie = `builder.hardReset=;max-age=0`

      window.parent?.postMessage(
        {
          type: 'builder.freshContentFetched',
          data: {
            contentId: props.content.id,
            lastUpdated: lastUpdatedAutosave,
          },
        },
        '*'
      )
    } else {
      console.log(
        'hard reset cookie is newer than lastUpdatedAutosave, refreshing'
      )
      document.cookie = `builder.hardReset=${hardResetCookieValue};max-age=100`
      router.refresh()
    }
  }, [props.content])

  function processMessage(event: MessageEvent) {
    const { data: message } = event
    if (message) {
      switch (message.type) {
        case 'builder.configureSdk': {
          const messageContent = message.data
          const { breakpoints, contentId } = messageContent
          if (!contentId || contentId !== builderContextSignal.content?.id) {
            return
          }
          if (breakpoints) {
            mergeNewContent({ meta: { breakpoints } })
          }
          break
        }
        case 'builder.hardReset': {
          const lastUpdatedAutosave = parseInt(message.data.lastUpdatedAutosave)

          console.log(
            'received hard reset with lastUpdated: ',
            lastUpdatedAutosave
          )

          const lastUpdatedToUse =
            !isNaN(lastUpdatedAutosave) && lastUpdatedAutosave > lastUpdated
              ? lastUpdatedAutosave
              : lastUpdated
          setLastUpdated(lastUpdatedToUse)

          console.log('builder.hardReset', { shouldSendResetCookie })
          if (shouldSendResetCookie) {
            console.log('refreshing with hard reset cookie')
            document.cookie = `builder.hardReset=${lastUpdatedToUse};max-age=100`
            setShouldSendResetCookie(false)
            router.refresh()
          } else {
            console.log('not refreshing.')
          }
          break
        }

        case 'builder.patchUpdates': {
          const patches = message.data.data

          for (const contentId of Object.keys(patches)) {
            const patchesForBlock = patches[contentId]

            // TO-DO: fix scenario where we end up with -Infinity
            const getLastIndex = () =>
              Math.max(
                ...document.cookie
                  .split(';')
                  .filter((x) => x.trim().startsWith(contentIdKeyPrefix))
                  .map((x) => {
                    const parsedIndex = parseInt(
                      x.split('=')[0].split(contentIdKeyPrefix)[1]
                    )
                    return isNaN(parsedIndex) ? 0 : parsedIndex
                  })
              ) || 0

            const contentIdKeyPrefix = `builder.patch.${contentId}.`

            // get last index of patch for this block
            const lastIndex = getLastIndex()

            const cookie = {
              name: `${contentIdKeyPrefix}${lastIndex + 1}`,
              value: encodeURIComponent(JSON.stringify(patchesForBlock)),
            }

            // remove hard reset cookie just in case it was set in a prior update.
            document.cookie = `builder.hardReset=no;max-age=0`

            document.cookie = `${cookie.name}=${cookie.value};max-age=30`

            const newCookieValue = document.cookie
              .split(';')
              .find((x) => x.trim().startsWith(cookie.name))
              ?.split('=')[1]

            if (newCookieValue !== cookie.value) {
              console.warn('Cookie did not save correctly.')
              console.log('Clearing all Builder patch cookies...')

              window.parent?.postMessage(
                { type: 'builder.patchUpdatesFailed', data: message.data },
                '*'
              )

              document.cookie
                .split(';')
                .filter((x) => x.trim().startsWith(contentIdKeyPrefix))
                .forEach((x) => {
                  document.cookie = `${x.split('=')[0]}=;max-age=0`
                })

              setShouldSendResetCookie(true)
              // TO-DO: we want to add a counter here that forces a refetch.
              // we will also read this counter
              // const newParams = new URLSearchParams(searchParams.toString())
              // const oldCounter = parseInt(newParams.get('builder.edit-counter') || '0')
              // newParams.set('builder.edit-counter', (oldCounter + 1).toString())
              // const newUrl = `${pathname}?${newParams.toString()}`
              // router.replace(newUrl)

              // const lastUpdatedAutosave = parseInt(
              //   message.data.lastUpdatedAutosave
              // )

              // let lastUpdatedToUse = lastUpdated
              // if (lastUpdatedAutosave > lastUpdated) {
              //   setLastUpdated(lastUpdatedAutosave)
              //   lastUpdatedToUse = lastUpdatedAutosave
              // }

              // console.log(
              //   'setting hard reset with lastUpdated: ',
              //   lastUpdatedAutosave
              // )
            } else {
              console.log('cookie saved correctly')
              router.refresh()
            }
          }

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
      evaluateJsCode()
      runHttpRequests()
      emitStateUpdate()
    }
  }, [])

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
    console.log('creating listener')
    window.addEventListener('message', processMessage)
    return () => {
      window.removeEventListener('message', processMessage)
    }
  }, [shouldSendResetCookie])

  useEffect(() => {
    return () => {
      if (isBrowser()) {
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
        {builderContextSignal.content ? props.children : null}
      </div>
    </>
  )
}
