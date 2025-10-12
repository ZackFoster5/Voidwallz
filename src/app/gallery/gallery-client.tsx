'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/scroll-animations'
import { WallpaperPreviewModal } from '@/components/wallpaper-preview-modal'
import { cn } from '@/lib/utils'
import { loadStoredWallpapers, WALLPAPER_UPDATE_EVENT, type WallpaperEntry } from '@/lib/wallpaper-store'
import { useSearchParams, useRouter } from 'next/navigation'

const baseCategories = ['all', 'nature', 'abstract', 'gaming', 'cars', 'space', 'minimalist']

export type GalleryWallpaper = {
  id: string
  title: string
  slug: string
  thumbnailPath: string
  width: number
  height: number
  category: string
  tags: string[]
  downloads: number
  views: number
  featured: boolean
  resolution: string
  deviceType?: 'desktop' | 'mobile'
  featuredUntil?: string
  createdAt?: string
}

type GalleryClientProps = {
  baseWallpapers: GalleryWallpaper[]
  fixedDevice?: 'desktop' | 'mobile'
  title?: string
}

export default function GalleryClient({ baseWallpapers, fixedDevice, title }: GalleryClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('featured')
  const [deviceFilter, setDeviceFilter] = useState<'desktop' | 'mobile'>(fixedDevice ?? 'desktop')
  const [previewWallpaper, setPreviewWallpaper] = useState<GalleryWallpaper | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [storedWallpapers, setStoredWallpapers] = useState<WallpaperEntry[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const paramsCategory = searchParams.get('category')
    if (paramsCategory) {
      setSelectedCategory(paramsCategory.toLowerCase())
    }

    if (fixedDevice) {
      setDeviceFilter(fixedDevice)
      return
    }

    const paramsDevice = searchParams.get('device')
    if (paramsDevice === 'desktop' || paramsDevice === 'mobile') {
      setDeviceFilter(paramsDevice)
    }
  }, [searchParams, fixedDevice])

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase())
    }, 200)

    return () => window.clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    const sync = () => {
      const wallpapers = loadStoredWallpapers()
      setStoredWallpapers(wallpapers)
    }
    sync()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', sync)
      window.addEventListener(WALLPAPER_UPDATE_EVENT, sync as EventListener)
      return () => {
        window.removeEventListener('storage', sync)
        window.removeEventListener(WALLPAPER_UPDATE_EVENT, sync as EventListener)
      }
    }
  }, [])

  const combinedWallpapers = useMemo<GalleryWallpaper[]>(() => {
    const uploads = storedWallpapers.map((entry) => ({
      id: entry.id,
      title: entry.title,
      slug: entry.id,
      thumbnailPath: entry.previewUrl ?? 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=600&fit=crop',
      width: entry.deviceType === 'mobile' ? 1170 : 1920,
      height: entry.deviceType === 'mobile' ? 2532 : 1080,
      category: entry.category.toLowerCase(),
      tags: ['user-upload'],
      downloads: 0,
      views: 0,
      featured: entry.featuredUntil ? new Date(entry.featuredUntil) > new Date() : true,
      resolution: entry.deviceType === 'mobile' ? '1170x2532' : '1920x1080',
      deviceType: entry.deviceType,
      featuredUntil: entry.featuredUntil,
      createdAt: entry.createdAt,
    }))

    return [...uploads, ...baseWallpapers]
  }, [storedWallpapers, baseWallpapers])

  const categories = useMemo(() => {
    const uploadCategories = new Set<string>()
    storedWallpapers.forEach((entry) => uploadCategories.add(entry.category.toLowerCase()))
    return Array.from(new Set([...baseCategories, ...uploadCategories]))
  }, [storedWallpapers])

  const filteredWallpapers = useMemo(() => {
    const query = debouncedSearch

    const filtered = combinedWallpapers.filter((wallpaper) => {
      const matchesCategory = selectedCategory === 'all' || wallpaper.category === selectedCategory
      const matchesDevice = (wallpaper.deviceType ?? 'desktop') === deviceFilter
      if (!query) return matchesCategory && matchesDevice

      const lowerTitle = wallpaper.title.toLowerCase()
      const tagMatch = wallpaper.tags.some((tag) => tag.toLowerCase().includes(query))
      const titleMatch = lowerTitle.includes(query)

      return matchesCategory && matchesDevice && (titleMatch || tagMatch)
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads
        case 'views':
          return b.views - a.views
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        default:
          return 0
      }
    })

    return sorted
  }, [combinedWallpapers, debouncedSearch, selectedCategory, deviceFilter, sortBy])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  const openPreview = (wallpaper: GalleryWallpaper) => {
    setPreviewWallpaper(wallpaper)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewWallpaper(null)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto">
        <FadeInUp>
          <div className="text-center mb-12">
            <div className="h-[150px] md:h-[200px] flex items-center justify-center mb-4">
              <TextHoverEffect text={(title ?? (fixedDevice === 'mobile' ? 'PHONE' : fixedDevice === 'desktop' ? 'DESKTOP' : 'GALLERY'))} />
            </div>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              {fixedDevice === 'mobile' ? 'Phone wallpapers' : fixedDevice === 'desktop' ? 'Desktop wallpapers' : 'Explore our complete collection of high-quality wallpapers'}
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className="mb-8 space-y-4">
            <div className="text-sm font-mono uppercase tracking-wide text-foreground/60">
              {filteredWallpapers.length} wallpapers found
            </div>

            <div className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-3 md:flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {!fixedDevice ? (
                      (['desktop', 'mobile'] as ('desktop' | 'mobile')[]).map((device) => (
                        <button
                          key={device}
                          onClick={() => {
                            setDeviceFilter(device)
                            const params = new URLSearchParams(window.location.search)
                            params.set('device', device)
                            router.replace(`/gallery${params.toString() ? `?${params.toString()}` : ''}`)
                          }}
                          className={cn(
                            'px-5 py-2 border-2 border-foreground font-mono uppercase tracking-wide text-xs transition-transform duration-150',
                            'shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px]',
                            deviceFilter === device ? 'bg-primary text-background' : 'bg-card hover:bg-primary hover:text-background'
                          )}
                          type="button"
                        >
                          {device === 'desktop' ? 'Desktop wallpapers' : 'Mobile wallpapers'}
                        </button>
                      ))
                    ) : (
                      <span className="px-5 py-2 border-2 border-foreground bg-card font-mono uppercase tracking-wide text-xs">
                        {fixedDevice === 'mobile' ? 'Phone wallpapers' : 'Desktop wallpapers'}
                      </span>
                    )}
                  </div>

                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search wallpapers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "w-full bg-transparent pl-4 pr-14 py-3 rounded-full border-2 border-foreground text-foreground",
                        "placeholder:text-foreground/60 focus:outline-none focus:bg-card",
                        "shadow-[6px_6px_0px_0px_var(--color-foreground)] font-mono font-bold uppercase tracking-wide transition-all duration-300",
                        "focus:shadow-[3px_3px_0px_0px_var(--color-foreground)] focus:translate-x-1 focus:translate-y-1"
                      )}
                    />
                    <button
                      className={cn(
                        "absolute right-1 top-1 bottom-1 w-10 h-10 rounded-full bg-foreground text-background",
                        "flex items-center justify-center hover:bg-primary transition-all duration-200",
                        "border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-background)]",
                        "hover:shadow-[1px_1px_0px_0px_var(--color-background)] hover:translate-x-0.5 hover:translate-y-0.5"
                      )}
                      type="button"
                      aria-label="Search wallpapers"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:flex-shrink-0">
                  <div
                    className={cn(
                      "flex items-center justify-center w-11 h-11 border-2 border-foreground bg-card text-foreground",
                      "shadow-[3px_3px_0px_0px_var(--color-foreground)]"
                    )}
                    aria-hidden="true"
                  >
                    <FunnelIcon className="w-5 h-5" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={cn(
                      "px-4 py-3 border-2 border-foreground bg-card text-foreground",
                      "focus:outline-none focus:bg-primary focus:text-background",
                      "shadow-[4px_4px_0px_0px_var(--color-foreground)] font-mono uppercase tracking-wide"
                    )}
                    aria-label="Sort wallpapers"
                  >
                    <option value="featured">FEATURED</option>
                    <option value="downloads">DOWNLOADS</option>
                    <option value="views">VIEWS</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-4 py-2 text-sm border-2 border-foreground font-mono uppercase tracking-wide transition-all duration-200",
                      "hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
                      selectedCategory === category
                        ? "bg-primary text-background shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                        : "bg-card hover:bg-primary hover:text-background shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.3}>
          <div className="mb-6 text-center">
            <span className="text-foreground/70 font-mono">
              {filteredWallpapers.length} wallpapers found
            </span>
          </div>
        </FadeInUp>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredWallpapers.map((wallpaper) => (
            <StaggerItem key={wallpaper.id}>
              <div className="group relative h-full">
                <div
                  className={cn(
                    "card-brutalist p-0 overflow-hidden transition-all duration-300 h-full flex flex-col",
                    "group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]"
                  )}
                >
                  <div
                    className={cn(
                      'relative overflow-hidden',
                      'aspect-[4/5]'
                    )}
                  >
                    <Image
                      src={wallpaper.thumbnailPath}
                      alt={wallpaper.title}
                      fill
                      unoptimized={wallpaper.thumbnailPath.startsWith('blob:')}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                    />

                    {wallpaper.featured && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-background text-xs font-mono font-bold border border-foreground">
                        {wallpaper.featuredUntil ? 'NEW • 24H' : 'FEATURED'}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-3">
                        <motion.button
                          onClick={() => toggleFavorite(wallpaper.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-background/90 border-2 border-foreground hover:bg-primary hover:text-background transition-all duration-200"
                        >
                          <motion.div
                            animate={favorites.includes(wallpaper.id)
                              ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] }
                              : {}
                            }
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                          >
                            {favorites.includes(wallpaper.id) ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                              >
                                <HeartSolidIcon className="w-5 h-5 text-red-500" />
                              </motion.div>
                            ) : (
                              <HeartIcon className="w-5 h-5" />
                            )}
                          </motion.div>
                        </motion.button>
                        <motion.button
                          onClick={() => openPreview(wallpaper)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-background/90 border-2 border-foreground hover:bg-primary hover:text-background transition-all duration-200"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 mt-auto">
                    <h3 className="font-bold font-mono uppercase tracking-wide mb-2 text-sm line-clamp-1">
                      {wallpaper.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-foreground/70 font-mono">
                      <span>{wallpaper.resolution}</span>
                      <span>
                        {(wallpaper.deviceType ?? 'desktop').toUpperCase()} • {wallpaper.downloads} DL
                        {wallpaper.deviceType ? ` • ${wallpaper.deviceType === 'mobile' ? 'PORTRAIT' : 'LANDSCAPE'}` : ''}
                      </span>
                    </div>
                    {wallpaper.createdAt && (
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-foreground/50">
                        Added {new Date(wallpaper.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(wallpaper.tags ?? []).slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-card border border-foreground text-xs font-mono uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeInUp delay={0.4}>
          <div className="text-center mt-12">
            <button className="btn-brutalist px-8 py-4 text-lg font-bold">
              LOAD MORE WALLPAPERS
            </button>
          </div>
        </FadeInUp>
      </div>

      <WallpaperPreviewModal
        wallpaper={previewWallpaper}
        isOpen={isPreviewOpen}
        onClose={closePreview}
        isFavorite={previewWallpaper ? favorites.includes(previewWallpaper.id) : false}
        onToggleFavorite={() => previewWallpaper && toggleFavorite(previewWallpaper.id)}
      />
    </div>
  )
}
