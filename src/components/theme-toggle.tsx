'use client'

import { motion } from 'motion/react'
import { Icon } from '@/components/ui/icon'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <label className={cn('theme-switch', className)}>
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        aria-label="Toggle theme"
      />
      <span className="theme-switch__slider theme-switch__slider--round">
        <span className="theme-switch__sun-moon">
          <span className="theme-switch__light-ray theme-switch__light-ray--one" />
          <span className="theme-switch__light-ray theme-switch__light-ray--two" />
          <span className="theme-switch__light-ray theme-switch__light-ray--three" />
          <span className="theme-switch__moon-dot theme-switch__moon-dot--one" />
          <span className="theme-switch__moon-dot theme-switch__moon-dot--two" />
          <span className="theme-switch__moon-dot theme-switch__moon-dot--three" />
        </span>

        <span className="theme-switch__cloud theme-switch__cloud--light theme-switch__cloud--one" />
        <span className="theme-switch__cloud theme-switch__cloud--light theme-switch__cloud--two" />
        <span className="theme-switch__cloud theme-switch__cloud--light theme-switch__cloud--three" />
        <span className="theme-switch__cloud theme-switch__cloud--dark theme-switch__cloud--four" />
        <span className="theme-switch__cloud theme-switch__cloud--dark theme-switch__cloud--five" />
        <span className="theme-switch__cloud theme-switch__cloud--dark theme-switch__cloud--six" />

        <span className="theme-switch__stars">
          <span className="theme-switch__star theme-switch__star--one" />
          <span className="theme-switch__star theme-switch__star--two" />
          <span className="theme-switch__star theme-switch__star--three" />
          <span className="theme-switch__star theme-switch__star--four" />
        </span>
      </span>
    </label>
  )
}

// Alternative Larger Version for Landing Page
export function ThemeToggleLarge({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-20 h-10 rounded-full border-2 border-foreground transition-all duration-300",
        "shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
        "hover:translate-x-1 hover:translate-y-1 focus:outline-none",
        isDark ? "bg-foreground" : "bg-background",
        className
      )}
      aria-label="Toggle theme"
    >
      {/* Track Background */}
      <div className={cn(
        "absolute inset-1 rounded-full transition-all duration-300",
        isDark ? "bg-background" : "bg-card"
      )}>
        {/* Icons in track */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <Icon name="sun" className={cn(
            "w-5 h-5 transition-all duration-300",
            isDark ? "text-foreground/30" : "text-primary"
          )} />
          <Icon name="moon" className={cn(
            "w-5 h-5 transition-all duration-300",
            isDark ? "text-primary" : "text-foreground/30"
          )} />
        </div>
      </div>

      {/* Sliding Toggle */}
      <motion.div
        className={cn(
          "absolute top-1 w-8 h-8 rounded-full border-2 border-foreground",
          "flex items-center justify-center shadow-sm",
          isDark ? "bg-primary" : "bg-secondary"
        )}
        animate={{
          x: isDark ? 40 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {/* Toggle Icon */}
        <motion.div
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Icon name="moon" className="w-4 h-4 text-background" />
          ) : (
            <Icon name="sun" className="w-4 h-4 text-background" />
          )}
        </motion.div>
      </motion.div>

    </button>
  )
}
