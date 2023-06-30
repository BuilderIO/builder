'use client'
import * as React from 'react'

export interface ButtonProps {
  attributes?: any
  text?: string
}

function SubmitButton(props: ButtonProps) {
  return (
    <button type="submit" {...props.attributes}>
      {props.text}
    </button>
  )
}

export default SubmitButton
