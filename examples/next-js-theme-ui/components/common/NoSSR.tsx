import React, { useEffect, useState } from 'react'

const NoSSR: React.FC<{ skeleton?: React.ReactNode }> = ({
  children,
  skeleton,
}) => {
  const [render, setRender] = useState(false)
  useEffect(() => setRender(true), [])
  if (render) {
    return <>{children}</>
  }
  if (skeleton) {
    return <>{skeleton}</>
  }
  return null
}
export default NoSSR
