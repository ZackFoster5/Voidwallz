import { Suspense } from 'react'
import GalleryClient from './gallery-client'
import RequireAuth from '@/components/auth/require-auth'

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading gallery…</div>}>
      <RequireAuth>
        <GalleryClient baseWallpapers={[]} title="VOID" />
      </RequireAuth>
    </Suspense>
  )
}
