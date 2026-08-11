import { type ReactNode } from 'react'

interface TestProps {
  children?: ReactNode
}

export function Test({ children }: TestProps) {
  return (
    <div>
        <p>Test Component</p>
        {children}
    </div>
  )
}
