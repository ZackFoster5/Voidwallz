"use client";

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface RequireAuthProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function RequireAuth({ children, redirectTo = '/' }: RequireAuthProps) {
  useEffect(() => {
    let ignore = false
    async function check() {
      const { data } = await supabase.auth.getSession()
      if (!ignore && !data.session) {
        window.location.href = redirectTo
      }
    }
    check()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) window.location.href = redirectTo
    })
    return () => {
      ignore = true
      sub.subscription.unsubscribe()
    }
  }, [redirectTo])

  return <>{children}</>
}
