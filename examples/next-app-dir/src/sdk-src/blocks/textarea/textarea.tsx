'use client'
import * as React from 'react'

export interface TextareaProps {
  attributes?: any
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
}

function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...props.attributes}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
    />
  )
}

export default Textarea
