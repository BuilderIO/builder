import React, { useState } from 'react'
import 'react-quill/dist/quill.snow.css'

const CustomRichText: React.FC = (props) => {
  return (
    <>
      {/* @ts-ignore-next-line */}
      <div dangerouslySetInnerHTML={{ __html: props?.body }} />
    </>
  )
}

export default CustomRichText
