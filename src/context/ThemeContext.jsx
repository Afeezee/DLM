import { useEffect, useState } from 'react'
import { ThemeContext } from './theme-context'

const themeStorageKey = 'dlm-theme'

function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  root.dataset.theme = theme
  root.style.colorScheme = theme
  root.classList.toggle('theme-dark', theme === 'dark')
  root.classList.toggle('theme-light', theme === 'light')
}

function resolveInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey)
  const initialTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light'

  applyTheme(initialTheme)

  return initialTheme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme)

  useEffect(() => {
    applyTheme(theme)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(themeStorageKey, theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark: theme === 'dark',
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}