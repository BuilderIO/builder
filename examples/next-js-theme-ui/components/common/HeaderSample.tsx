/** @jsxImportSource theme-ui */
import React from 'react'
import { Themed } from 'theme-ui'

interface HeaderSampleProps {
  className?: string
  title: string
  description?: string
  hide?: boolean
  action?: React.ReactNode
  delay?: number
}

const HeaderSample: React.FC<HeaderSampleProps> = ({ title }) => {
  return (
    <Themed.div sx={{ display: 'flex', justifyContent: 'center', p: [1, 2] }}>
      <Themed.h1 sx={{ color: 'primary' }}>{title}</Themed.h1>
    </Themed.div>
  )
}

export default HeaderSample
