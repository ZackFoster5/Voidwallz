import { Suspense } from 'react'
import GalleryClient from './gallery-client'

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading gallery…</div>}>
      <GalleryClient baseWallpapers={[]} />
    </Suspense>
  )
}
