'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import RequireAuth from '@/components/auth/require-auth'
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  SparklesIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/scroll-animations'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { cn } from '@/lib/utils'
import { loadStoredWallpapers, type WallpaperEntry } from '@/lib/wallpaper-store'

type DeviceType = 'desktop' | 'mobile'

type BaseCategory = {
  name: string
  slug: string
  description: string
  wallpaperCount: number
  subcategories: string[]
}

const baseCollections: Record<DeviceType, BaseCategory[]> = {
  desktop: [
    {
      name: 'Nature',
      slug: 'nature',
      description: 'Organic landscapes, oceans, and earthy palettes for immersive workspaces.',
      wallpaperCount: 182,
      subcategories: ['Forests', 'Mountains', 'Seascapes', 'Botanical'],
    },
    {
      name: 'Abstract',
      slug: 'abstract',
      description: 'Bold shapes, gradients, and brutalist minimalism to energize your desktop.',
      wallpaperCount: 147,
      subcategories: ['Gradients', 'Geometric', 'Monochrome'],
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      description: 'Futuristic cities, neon grids, and cinematic shots for players and creators.',
      wallpaperCount: 96,
      subcategories: ['Cyberpunk', 'Fantasy', 'Esports'],
    },
    {
      name: 'Cars',
      slug: 'cars',
      description: 'Supercars, classics, and industrial rigs captured in high-resolution detail.',
      wallpaperCount: 74,
      subcategories: ['Supercars', 'Classics', 'Concept'],
    },
    {
      name: 'Space',
      slug: 'space',
      description: 'Cosmic vistas, galaxies, and sci-fi renderings for deep focus sessions.',
      wallpaperCount: 58,
      subcategories: ['Galaxies', 'Planets', 'Nebulae'],
    },
    {
      name: 'Minimalist',
      slug: 'minimalist',
      description: 'Clean compositions, monochrome gradients, and geometric calm.',
      wallpaperCount: 109,
      subcategories: ['Neutral', 'Color Pop', 'Linework'],
    },
  ],
  mobile: [
    {
      name: 'Vibes',
      slug: 'vibes',
      description: 'Pocket-perfect artwork for lock screens and homescreens.',
      wallpaperCount: 132,
      subcategories: ['Pastel', 'Moody', 'Gradient'],
    },
    {
      name: 'Cities',
      slug: 'cities',
      description: 'Skyline shots and street photography optimized for vertical crops.',
      wallpaperCount: 88,
      subcategories: ['Nightlife', 'Architecture', 'Aerial'],
    },
    {
      name: 'Minimal Cards',
      slug: 'minimal-cards',
      description: 'Widget-friendly wallpapers with intentional blank space.',
      wallpaperCount: 104,
      subcategories: ['Dark Mode', 'Light Mode', 'Typography'],
    },
    {
      name: 'Anime Frames',
      slug: 'anime',
      description: 'Cinematic stills and stylised art for the anime obsessed.',
      wallpaperCount: 76,
      subcategories: ['Shonen', 'Studio Ghibli', 'Retro'],
    },
    {
      name: 'Nature Portraits',
      slug: 'nature-portrait',
      description: 'Vertical captures of oceans, forests, and natural textures.',
      wallpaperCount: 141,
      subcategories: ['Water', 'Flora', 'Desert'],
    },
  ],
}

type CategoryRecord = {
  id?: string
  name: string
  slug: string
  description?: string | null
  wallpaperCount?: number | null
  subcategories?: string[]
  _count?: {
    wallpapers?: number | null
  } | null
}

const iconMap: Record<string, ReactNode> = {
  nature: <GlobeAltIcon className="w-6 h-6" />,
  abstract: <PuzzlePieceIcon className="w-6 h-6" />,
  gaming: <DevicePhoneMobileIcon className="w-6 h-6" />,
  cars: <TruckIcon className="w-6 h-6" />,
  space: <RocketLaunchIcon className="w-6 h-6" />,
  minimalist: <Squares2X2Icon className="w-6 h-6" />,
}

const accentMap: Record<string, string> = {
  nature: 'from-[#8DF3A6] via-[#49C38C] to-[#1A7B53]',
  abstract: 'from-[#FFC7F3] via-[#FC6FB3] to-[#9B2576]',
  gaming: 'from-[#86E0FF] via-[#28A1FF] to-[#0054D1]',
  cars: 'from-[#FFD7C2] via-[#FF8F70] to-[#D63A2F]',
  space: 'from-[#BDBDFF] via-[#6C6CFF] to-[#2A2ACD]',
  minimalist: 'from-[#F5F5F5] via-[#C7C7C7] to-[#7A7A7A]',
  default: 'from-primary via-secondary to-foreground',
}

function getAccentGradient(slug: string) {
  return accentMap[slug] ?? accentMap.default
}

function getIcon(slug: string) {
  return iconMap[slug] ?? <SparklesIcon className="w-6 h-6" />
}

function getCount(category: CategoryRecord) {
  if (typeof category.wallpaperCount === 'number') return category.wallpaperCount
  if (typeof category._count?.wallpapers === 'number') return category._count?.wallpapers
  return null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>(baseCollections.desktop)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'alphabetical' | 'count-desc' | 'count-asc'>('alphabetical')
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop')
  const [storedWallpapers, setStoredWallpapers] = useState<WallpaperEntry[]>([])

  useEffect(() => {
    let isMounted = true

    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories?includeCount=true', {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data)
          setError(null)
        } else if (isMounted) {
          setError('No live categories yet. Showing our curated sets instead.')
          setCategories(baseCollections.desktop)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load categories', error)
          setError('Unable to reach the database. Showing curated categories for now.')
          setCategories(baseCollections.desktop)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCategories()

    const loadLocal = () => {
      const wallpapers = loadStoredWallpapers()
      setStoredWallpapers(wallpapers)
    }

    loadLocal()

    if (typeof window !== 'undefined') {
      const handler = () => loadLocal()
      window.addEventListener('storage', handler)
      return () => {
        window.removeEventListener('storage', handler)
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

  const deviceCollections = useMemo(() => {
    const base = baseCollections[activeDevice]
    const uploaded = storedWallpapers.filter((wallpaper) => wallpaper.deviceType === activeDevice)

    const uploadCountByCategory = uploaded.reduce<Record<string, number>>((acc, wallpaper) => {
      acc[wallpaper.category] = (acc[wallpaper.category] ?? 0) + 1
      return acc
    }, {})

    const merged = base.map((category) => {
      const apiMatch = categories.find((item) => item.slug === category.slug)
      const baseCount = apiMatch ? getCount(apiMatch) ?? category.wallpaperCount : category.wallpaperCount
      return {
        ...category,
        wallpaperCount: baseCount + (uploadCountByCategory[category.slug] ?? 0),
      }
    })

    // include uploaded categories that aren't in base list
    uploaded.forEach((wallpaper) => {
      if (!merged.some((entry) => entry.slug === wallpaper.category)) {
        merged.push({
          name: wallpaper.category.replaceAll('-', ' '),
          slug: wallpaper.category,
          description: 'Fresh uploads waiting for curation.',
          wallpaperCount: uploadCountByCategory[wallpaper.category] ?? 1,
          subcategories: ['New Uploads'],
        })
      }
    })

    return merged
  }, [activeDevice, categories, storedWallpapers])

  const displayCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = deviceCollections.filter((category) => {
      const description = category.description ?? ''
      const subMatches = category.subcategories?.some((sub) => sub.toLowerCase().includes(query)) ?? false
      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        subMatches
      )
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name)
      }

      const countA = getCount(a) ?? 0
      const countB = getCount(b) ?? 0

      if (sortBy === 'count-desc') {
        return countB - countA
      }

      return countA - countB
    })

    return sorted
  }, [deviceCollections, searchQuery, sortBy])

  return (
    <RequireAuth>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <FadeInUp>
          <div className="text-center mb-12">
            <div className="h-[150px] md:h-[200px] flex items-center justify-center mb-4">
              <TextHoverEffect text="CATEGORIES" />
            </div>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Dial into the exact vibe you want. Filter by mood, medium, or aesthetic to curate the perfect wallpaper rotation.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="mb-10 space-y-4">
            <div className="text-sm font-mono uppercase tracking-wide text-foreground/60">
              {isLoading ? 'Loading categories…' : `${displayCategories.length} ${activeDevice} categories`}
            </div>

            <div className="flex items-center gap-3">
              {(['desktop', 'mobile'] as DeviceType[]).map((device) => (
                <button
                  key={device}
                  onClick={() => setActiveDevice(device)}
                  className={cn(
                    'px-5 py-2 border-2 border-foreground font-mono uppercase tracking-wide text-sm transition-all duration-200',
                    'shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-1 hover:translate-y-1',
                    activeDevice === device
                      ? 'bg-primary text-background'
                      : 'bg-card hover:bg-primary hover:text-background'
                  )}
                  type="button"
                >
                  {device === 'desktop' ? 'Desktop' : 'Mobile'} wallpapers
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:flex-1 md:max-w-lg">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search categories..."
                  className={cn(
                    'w-full bg-transparent pl-4 pr-14 py-3 rounded-full border-2 border-foreground text-foreground',
                    'placeholder:text-foreground/60 font-mono font-bold uppercase tracking-wide',
                    'shadow-[6px_6px_0px_0px_var(--color-foreground)] focus:outline-none focus:bg-card',
                    'transition-all duration-300 focus:shadow-[3px_3px_0px_0px_var(--color-foreground)] focus:translate-x-1 focus:translate-y-1'
                  )}
                />
                <button
                  className={cn(
                    'absolute right-1 top-1 bottom-1 w-10 h-10 rounded-full bg-foreground text-background',
                    'flex items-center justify-center hover:bg-primary transition-all duration-200',
                    'border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-background)]',
                    'hover:shadow-[1px_1px_0px_0px_var(--color-background)] hover:translate-x-0.5 hover:translate-y-0.5'
                  )}
                  type="button"
                  aria-label="Search categories"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 md:gap-4 md:flex-shrink-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-11 h-11 border-2 border-foreground bg-card text-foreground',
                    'shadow-[3px_3px_0px_0px_var(--color-foreground)]'
                  )}
                  aria-hidden="true"
                >
                  <FunnelIcon className="w-5 h-5" />
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                  className={cn(
                    'px-4 py-3 border-2 border-foreground bg-card text-foreground font-mono uppercase tracking-wide',
                    'shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:bg-primary hover:text-background transition-colors duration-200'
                  )}
                  aria-label="Sort categories"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="count-desc">Most Wallpapers</option>
                  <option value="count-asc">Least Wallpapers</option>
                </select>
              </div>
            </div>
          </div>
        </FadeInUp>

        {error && (
          <FadeInUp delay={0.2}>
            <div className="mb-8 border-2 border-foreground bg-secondary/10 text-foreground px-4 py-3 font-mono text-sm uppercase tracking-wider">
              {error}
            </div>
          </FadeInUp>
        )}

        {displayCategories.length === 0 && !isLoading ? (
          <FadeInUp delay={0.25}>
            <div className="text-center border-2 border-dashed border-foreground/40 py-16">
              <p className="font-mono uppercase tracking-wide text-foreground/60">
                No categories match your search.
              </p>
            </div>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayCategories.map((category) => {
              const slug = category.slug.toLowerCase()
              const count = getCount(category)

              return (
                <StaggerItem key={category.slug}>
                  <Link href={`/gallery?category=${encodeURIComponent(category.slug)}`} className="group h-full">
                    <article className={cn(
                      'card-brutalist h-full overflow-hidden flex flex-col justify-between relative p-6 transition-transform duration-200',
                      'group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]'
                    )}>
                      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', getAccentGradient(slug))} />

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-foreground/70">
                            {getIcon(slug)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold font-mono uppercase tracking-wide">
                              {category.name}
                            </h3>
                            <p className="text-xs text-foreground/60 font-mono uppercase tracking-wide">
                              explore {category.slug}
                            </p>
                          </div>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors duration-200" />
                      </div>

                      <p className="text-sm text-foreground/70 leading-relaxed mb-6">
                        {category.description ?? 'Curated visuals crafted to keep your setup feeling fresh and intentional.'}
                      </p>

                      <div className="flex items-center justify-between font-mono uppercase text-xs text-foreground/60">
                        <span>
                          {count ? `${count} wallpapers` : 'Curated collection'}
                        </span>
                        <span className="px-3 py-1 border-2 border-foreground bg-background group-hover:bg-primary group-hover:text-background transition-colors duration-200">
                          View set
                        </span>
                      </div>

                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {category.subcategories.map((sub) => (
                            <span
                              key={sub}
                              className="px-3 py-1 border border-foreground text-xs font-mono uppercase tracking-wide bg-card/60"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
        </div>
      </div>
    </RequireAuth>
  )
}
