import React, { FC } from 'react'

export interface State {
  navigationLinks?: Array<{ link: string; title: string }>
  logo?: { image?: string; text: string; width: number; height: number }
}


export const UIContext = React.createContext<State>({})

UIContext.displayName = 'UIContext'

export const UIProvider: FC<{ siteSettings: Partial<State> }> = ({
  siteSettings,
  children,
}) => {
  return <UIContext.Provider value={siteSettings} children={children} />
}

export const useUI = () => {
  const context = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`)
  }
  return context
}

export const ManagedUIContext: FC<{ siteSettings: Partial<State> }> = ({
  children,
  siteSettings,
}) => <UIProvider siteSettings={siteSettings}>{children}</UIProvider>
