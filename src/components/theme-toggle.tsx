'use client'

import { motion } from 'motion/react'
import { Icon } from '@/components/ui/icon'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-7 rounded-full border-2 border-foreground transition-all duration-300",
        "shadow-[3px_3px_0px_0px_var(--color-foreground)] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)]",
        "hover:translate-x-1 hover:translate-y-1 focus:outline-none overflow-hidden",
        isDark ? "bg-gray-800" : "bg-gray-100",
        className
      )}
      aria-label="Toggle theme"
    >
      {/* Track Background with Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Icon name="sun" className={cn(
          "w-3 h-3 transition-all duration-300 z-10",
          isDark ? "text-gray-500" : "text-yellow-500"
        )} />
        <Icon name="moon" className={cn(
          "w-3 h-3 transition-all duration-300 z-10",
          isDark ? "text-blue-400" : "text-gray-400"
        )} />
      </div>

      {/* Sliding Toggle Circle */}
      <motion.div
        className={cn(
          "absolute top-0.5 w-6 h-6 rounded-full border-2 border-foreground z-20",
          "flex items-center justify-center",
          isDark ? "bg-primary" : "bg-secondary"
        )}
        animate={{
          x: isDark ? 26 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {/* Active Icon */}
        <motion.div
          animate={{ 
            rotate: isDark ? 0 : 0,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 0.3 },
            scale: { duration: 0.2 }
          }}
        >
          {isDark ? (
            <Icon name="moon" className="w-3 h-3 text-background" />
          ) : (
            <Icon name="sun" className="w-3 h-3 text-background" />
          )}
        </motion.div>
      </motion.div>

    </button>
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
