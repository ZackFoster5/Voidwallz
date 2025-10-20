import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import Header from './header'

export default async function HeaderServer() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // no-op on RSC render; we aren't mutating cookies here
        },
        remove() {
          // no-op
        },
      },
    }
  )

  const { data } = await supabase.auth.getSession()
  const session = data.session
  const user = session?.user
  type UserMeta = { firstName?: string; lastName?: string }
  const meta = (user?.user_metadata || {}) as UserMeta
  const initialName = [meta.firstName ?? '', meta.lastName ?? ''].filter(Boolean).join(' ') || user?.email || null

  return (
    <Header initialIsAuthed={!!session} initialName={initialName} />
  )
}
