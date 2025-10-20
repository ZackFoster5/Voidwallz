"use client"

import { useEffect, useState } from 'react'
import RequireAuth from '@/components/auth/require-auth'
import { Icon } from '@/components/ui/icon'
import { loadStoredWallpapers, type WallpaperEntry } from '@/lib/wallpaper-store'
import { WALLPAPER_UPDATE_EVENT } from '@/lib/wallpaper-store'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { FadeInUp } from '@/components/scroll-animations'

export default function VoidAIPage() {
  const [wallpapers, setWallpapers] = useState<WallpaperEntry[]>([])
  const [stats, setStats] = useState({ total: 0, featured: 0, tagged: 0 })

  useEffect(() => {
    const loadWallpapers = () => {
      const stored = loadStoredWallpapers()
      setWallpapers(stored)
      
      const now = new Date()
      const featured = stored.filter(w => w.featuredUntil && new Date(w.featuredUntil) > now).length
      const tagged = stored.filter(w => w.category && w.category !== 'general').length
      
      setStats({
        total: stored.length,
        featured,
        tagged
      })
    }

    loadWallpapers()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', loadWallpapers)
      window.addEventListener(WALLPAPER_UPDATE_EVENT, loadWallpapers as EventListener)
      return () => {
        window.removeEventListener('storage', loadWallpapers)
        window.removeEventListener(WALLPAPER_UPDATE_EVENT, loadWallpapers as EventListener)
      }
    }
  }, [])

  const recentFeatured = wallpapers
    .filter(w => w.featuredUntil)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <RequireAuth>
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <FadeInUp>
          <div className="mb-10 text-center">
            <div className="h-[120px] md:h-[160px] flex items-center justify-center mb-4">
              <TextHoverEffect text="VOIDAI" />
            </div>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Intelligent wallpaper curation powered by AI. Every new upload is automatically analyzed, tagged, and featured for 24 hours.
            </p>
          </div>
        </FadeInUp>

        {/* Feature Overview */}
        <FadeInUp delay={0.1}>
          <div className="card-brutalist p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="sparkles" className="w-6 h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold font-mono uppercase tracking-wide">How it Works</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 border-2 border-foreground bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="photo" className="w-5 h-5 text-primary" />
                  <h3 className="font-mono font-bold uppercase text-sm">1. Upload</h3>
                </div>
                <p className="text-sm text-foreground/70">
                  Post a new wallpaper and VoidAI instantly begins analyzing it.
                </p>
              </div>
              
              <div className="p-5 border-2 border-foreground bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="sparkles" className="w-5 h-5 text-primary" />
                  <h3 className="font-mono font-bold uppercase text-sm">2. Auto-Tag</h3>
                </div>
                <p className="text-sm text-foreground/70">
                  AI generates relevant tags and categories based on visual analysis.
                </p>
              </div>
              
              <div className="p-5 border-2 border-foreground bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="star" className="w-5 h-5 text-primary" />
                  <h3 className="font-mono font-bold uppercase text-sm">3. Feature</h3>
                </div>
                <p className="text-sm text-foreground/70">
                  Automatically featured on the feed for 24 hours to boost visibility.
                </p>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Stats */}
        <FadeInUp delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-brutalist p-6 text-center">
              <div className="text-4xl font-bold font-mono mb-2 text-primary">{stats.total}</div>
              <div className="text-sm font-mono uppercase tracking-wide text-foreground/70">Total Wallpapers</div>
            </div>
            
            <div className="card-brutalist p-6 text-center">
              <div className="text-4xl font-bold font-mono mb-2 text-secondary">{stats.featured}</div>
              <div className="text-sm font-mono uppercase tracking-wide text-foreground/70">Currently Featured</div>
            </div>
            
            <div className="card-brutalist p-6 text-center">
              <div className="text-4xl font-bold font-mono mb-2">{stats.tagged}</div>
              <div className="text-sm font-mono uppercase tracking-wide text-foreground/70">Auto-Tagged</div>
            </div>
          </div>
        </FadeInUp>

        {/* Recent Featured */}
        <FadeInUp delay={0.2}>
          <div className="card-brutalist p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Icon name="calendar-days" className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold font-mono uppercase tracking-wide">Recent Featured</h2>
              </div>
              <span className="text-xs font-mono uppercase tracking-wide text-foreground/60">24h window</span>
            </div>
            
            {recentFeatured.length === 0 ? (
              <div className="text-center py-8 text-foreground/60">
                <Icon name="photo" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-mono text-sm">No featured wallpapers yet.</p>
                <p className="text-xs mt-1">Upload a new wallpaper to see it featured here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFeatured.map((wallpaper) => {
                  const timeLeft = wallpaper.featuredUntil 
                    ? Math.max(0, Math.floor((new Date(wallpaper.featuredUntil).getTime() - Date.now()) / (1000 * 60 * 60)))
                    : 0
                  
                  return (
                    <div key={wallpaper.id} className="p-4 border-2 border-foreground bg-card flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-mono font-bold text-sm mb-1">{wallpaper.title}</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-0.5 border border-foreground/30 bg-background font-mono uppercase">
                            {wallpaper.category}
                          </span>
                          <span className="px-2 py-0.5 border border-foreground/30 bg-background font-mono uppercase">
                            {wallpaper.deviceType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {timeLeft > 0 ? (
                          <div className="text-right">
                            <div className="text-sm font-mono font-bold text-primary">{timeLeft}h</div>
                            <div className="text-xs text-foreground/60">remaining</div>
                          </div>
                        ) : (
                          <div className="text-xs text-foreground/50 font-mono">EXPIRED</div>
                        )}
                        <Icon name="star" className="w-5 h-5 text-yellow-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Info Card */}
        <FadeInUp delay={0.25}>
              <div className="mt-8 p-4 border-2 border-primary/50 bg-primary/5">
            <div className="flex items-start gap-3">
              <Icon name="info" className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-foreground/70">
                <p className="mb-2">
                  <strong className="text-foreground">VoidAI Auto-Tagging</strong> runs automatically whenever you upload a new wallpaper. 
                  The system analyzes colors, composition, and content to generate accurate tags and determine the best category.
                </p>
                <p>
                  Featured wallpapers appear at the top of the feed with a special badge for 24 hours, giving them maximum visibility.
                </p>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </RequireAuth>
  )
}

