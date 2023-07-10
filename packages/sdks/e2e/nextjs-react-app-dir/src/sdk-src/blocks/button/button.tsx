'use client'
import * as React from 'react'

export interface ButtonProps {
  attributes?: any
  text?: string
  link?: string
  openLinkInNewTab?: boolean
}

function Button(props: ButtonProps) {
  return (
    <>
      {props.link ? (
        <>
          <a
            role="button"
            {...props.attributes}
            href={props.link}
            target={props.openLinkInNewTab ? '_blank' : undefined}
          >
            {props.text}
          </a>
        </>
      ) : (
        <>
          <button
            className={
              /** * We have to explicitly provide `class` so that Mitosis knows to merge it with `css`. */
              props.attributes.class + ' button-2b50f164'
            }
            {...props.attributes}
          >
            {props.text}
          </button>
        </>
      )}

      <style>{`.button-2b50f164 {
  all: unset;
}`}</style>
    </>
  )
}

export default Button
