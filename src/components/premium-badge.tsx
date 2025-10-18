'use client'

import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'crown' | 'star' | 'text'
  className?: string
  animated?: boolean
}

export function PremiumBadge({ 
  size = 'md', 
  variant = 'crown', 
  className = '',
  animated = true 
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const BadgeContent = () => (
    <div className={cn(
      "inline-flex items-center space-x-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-mono font-bold uppercase tracking-wide border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)]",
      sizeClasses[size],
      className
    )}>
      {variant === 'crown' && <Icon name="star" className={iconSizes[size]} />}
      {variant === 'star' && <Icon name="sparkles" className={iconSizes[size]} />}
      <span>PREMIUM</span>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 15
        }}
      >
        <BadgeContent />
      </motion.div>
    )
  }

  return <BadgeContent />
}

// Premium user indicator for profiles/comments
export function PremiumUserBadge({ className = '' }: { className?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={cn("inline-flex", className)}
    >
      <div className="relative">
        <Icon name="star" className="w-5 h-5 text-yellow-500" />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
        >
          <Icon name="star" className="w-5 h-5 text-yellow-300" />
        </motion.div>
      </div>
    </motion.div>
  )
}

// Premium feature lock indicator
export function PremiumLock({ className = '' }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center space-x-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500 text-yellow-600 font-mono text-sm font-bold uppercase tracking-wide",
      className
    )}>
      <Icon name="star" className="w-4 h-4" />
      <span>Premium Only</span>
    </div>
  )
}
