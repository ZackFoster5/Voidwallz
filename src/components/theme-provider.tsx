'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.setAttribute('data-theme', theme)
    
    // Store in localStorage
    localStorage.setItem('voidwallz-theme', theme)
  }, [theme])

  useEffect(() => {
    // Load theme from localStorage on mount
    const storedTheme = localStorage.getItem('voidwallz-theme') as Theme | null

    if (storedTheme === 'dark') {
      setTheme('dark')
      return
    }

    if (storedTheme === 'light') {
      setTheme(defaultTheme)
      localStorage.setItem('voidwallz-theme', defaultTheme)
      return
    }

    // Fallback to default brutalist palette
    setTheme(defaultTheme)
    localStorage.setItem('voidwallz-theme', defaultTheme)
  }, [defaultTheme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
