import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import HomeClient from './home-client'

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data } = await supabase.auth.getSession()
  if (data.session) {
    redirect('/feed')
  }

  return <HomeClient />
}
