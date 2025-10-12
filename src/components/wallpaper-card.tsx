'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { cn, formatNumber } from '@/lib/utils'

interface WallpaperCardProps {
  wallpaper: {
    id: string
    title: string
    slug: string
    thumbnailPath: string
    width: number
    height: number
    downloadsCount: number
    ratingAverage: number
    featured: boolean
    category: {
      name: string
      slug: string
    }
    tags: Array<{
      tag: {
        name: string
        slug: string
      }
    }>
    _count: {
      downloads: number
      favorites: number
    }
  }
  className?: string
}

export function WallpaperCard({ wallpaper, className }: WallpaperCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    // TODO: Implement favorite API call
  }

  return (
    <Link href={`/wallpaper/${wallpaper.slug}`}>
      <div className={cn(
        "group relative bg-card border-2 border-foreground transition-all duration-300 overflow-hidden",
        "hover:shadow-[6px_6px_0px_0px_var(--color-foreground)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
        className
      )}>
        {/* Featured Badge */}
        {wallpaper.featured && (
          <div className="absolute top-2 left-2 z-10 bg-secondary text-background px-2 py-1 border border-foreground font-mono text-xs font-bold uppercase tracking-wide">
            Featured
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={wallpaper.thumbnailPath}
            alt={wallpaper.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleFavorite}
              className={cn(
                "p-2 bg-background/90 border border-foreground hover:bg-primary hover:text-background transition-colors duration-200",
                "shadow-[2px_2px_0px_0px_var(--color-foreground)]"
              )}
            >
              {isFavorited ? (
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {wallpaper.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-foreground/70 mb-3">
            <span className="font-mono uppercase tracking-wide">
              {wallpaper.category.name}
            </span>
            <span className="font-mono">
              {wallpaper.width} × {wallpaper.height}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {wallpaper.tags.slice(0, 3).map((tagRelation) => (
              <span
                key={tagRelation.tag.slug}
                className="px-2 py-1 bg-foreground/10 border border-foreground/20 text-xs font-mono uppercase tracking-wide"
              >
                {tagRelation.tag.name}
              </span>
            ))}
            {wallpaper.tags.length > 3 && (
              <span className="px-2 py-1 bg-foreground/10 border border-foreground/20 text-xs font-mono">
                +{wallpaper.tags.length - 3}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="font-mono">{formatNumber(wallpaper.downloadsCount)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <HeartIcon className="w-4 h-4" />
                <span className="font-mono">{formatNumber(wallpaper._count.favorites)}</span>
              </div>
            </div>
            
            {wallpaper.ratingAverage > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-secondary">★</span>
                <span className="font-mono">{wallpaper.ratingAverage.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
