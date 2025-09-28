'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function useMotionInView<T extends HTMLElement>(margin = '-100px') {
  const ref = useRef<T | null>(null)
  const shouldReduceMotion = prefersReducedMotion()
  const isInView = useInView(ref, {
    once: true,
    margin,
  })

  return { ref, shouldReduceMotion, isInView: shouldReduceMotion ? true : isInView }
}

// Fade in from bottom animation
export function FadeInUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, shouldReduceMotion, isInView } = useMotionInView<HTMLDivElement>('-100px')

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
      animate={isInView ? (shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : (shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 50 })}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger children animation
export function StaggerContainer({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  const { ref, shouldReduceMotion, isInView } = useMotionInView<HTMLDivElement>('-50px')

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export function StaggerItem({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Parallax floating elements
export function FloatingElement({ children, speed = 0.5, className = '' }: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const reduce = prefersReducedMotion()
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={reduce ? { y: 0 } : { y: [-10, 10, -10] }}
      transition={{
        duration: reduce ? 0 : 4,
        repeat: reduce ? 0 : Infinity,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Counter animation for stats
export function CounterAnimation({ 
  from = 0, 
  to, 
  duration = 2,
  suffix = '',
  className = '' 
}: {
  from?: number
  to: number
  duration?: number
  suffix?: string
  className?: string
}) {
  const { ref, shouldReduceMotion, isInView } = useMotionInView<HTMLDivElement>('0px')
  const [count, setCount] = useState(from)

  useEffect(() => {
    if (isInView) {
      if (shouldReduceMotion) {
        setCount(to)
        return
      }
      const startTime = Date.now()
      const startValue = from
      const endValue = to
      const totalDuration = duration * 1000 // Convert to milliseconds

      const updateCount = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / totalDuration, 1)
        
        // Easing function (easeOut)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress)
        
        setCount(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(updateCount)
        }
      }
      
      requestAnimationFrame(updateCount)
    }
  }, [isInView, from, to, duration])

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={isInView ? (shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : (shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 })}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.5 }}
      className={className}
    >
      {count}{suffix}
    </motion.div>
  )
}
