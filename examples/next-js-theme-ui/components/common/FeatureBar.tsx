/** @jsxRuntime classic */
/** @jsx jsx */
import React, { useEffect, useState } from 'react'
import { Themed, jsx } from 'theme-ui'
import { CenterModal, ModalTitle, ModalCloseTarget } from 'react-spring-modal'

interface FeatureBarProps {
  className?: string
  title: string
  description?: string
  hide?: boolean
  action?: React.ReactNode
  delay?: number
}

const FeatureBar: React.FC<FeatureBarProps> = ({
  title,
  description,
  action,
  hide,
  delay,
}) => {
  const [delayPassed, setDelayPassed] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => setDelayPassed(true), delay || 6000)
    return () => clearTimeout(timeout)
  })
  return (
    <CenterModal isOpen={delayPassed && !hide}>
      <ModalTitle>{title}</ModalTitle>
      {description}
      <Themed.div sx={{ display: 'flex', justifyContent: 'center', p: [1, 2] }}>
        {action && action}
      </Themed.div>
    </CenterModal>
  )
}

export default FeatureBar
