'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowDownTrayIcon, HeartIcon, ShareIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'
import { extractColorsFromImage, generateCSSVariables, type ColorPalette } from '@/lib/color-extractor'

interface Wallpaper {
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
}

interface WallpaperPreviewModalProps {
  wallpaper: Wallpaper | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function WallpaperPreviewModal({ 
  wallpaper, 
  isOpen, 
  onClose, 
  isFavorite, 
  onToggleFavorite 
}: WallpaperPreviewModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'info'>('details')
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null)
  const [isExtractingColors, setIsExtractingColors] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  // Extract colors when wallpaper changes
  useEffect(() => {
    if (wallpaper && isOpen) {
      setIsExtractingColors(true)
      setColorPalette(null)
      
      extractColorsFromImage(wallpaper.thumbnailPath)
        .then(palette => {
          setColorPalette(palette)
          setIsExtractingColors(false)
        })
        .catch(error => {
          console.error('Color extraction failed:', error)
          setIsExtractingColors(false)
          // Set fallback palette - soft and eye-friendly
          setColorPalette({
            primary: '#6366f1', // Softer indigo
            secondary: '#8b5cf6', // Muted purple
            accent: '#f59e0b', // Warm amber
            background: '#f8fafc', // Very light gray
            text: '#1e293b', // Soft dark gray
            textSecondary: '#475569' // Medium gray
          })
        })
    }
  }, [wallpaper?.id, wallpaper?.thumbnailPath, isOpen])

  if (!wallpaper) return null

  const handleDownload = () => {
    // Simulate download
    console.log('Downloading:', wallpaper.title)
    // In real app, this would trigger actual download
  }

  const handleShare = async () => {
    const shareData = {
      title: `${wallpaper.title} - Voidwallz`,
      text: `Check out this amazing ${wallpaper.category} wallpaper: ${wallpaper.title}`,
      url: `${window.location.origin}/wallpaper/${wallpaper.slug}`
    }

    try {
      // Use native Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url)
        // You could show a toast notification here
        console.log('Link copied to clipboard!')
      }
    } catch (error) {
      console.log('Error sharing:', error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        console.log('Link copied to clipboard!')
      } catch {
        console.log('Could not copy to clipboard')
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-6xl w-full max-h-[90vh] bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)] overflow-hidden"
            style={colorPalette ? {
              ...generateCSSVariables(colorPalette),
              backgroundColor: colorPalette.background,
              borderColor: colorPalette.primary,
              boxShadow: `8px 8px 0px 0px ${colorPalette.primary}`
            } : {
              backgroundColor: 'hsl(var(--background))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b-2 border-foreground bg-card"
              style={colorPalette ? {
                backgroundColor: colorPalette.background,
                borderColor: colorPalette.primary,
                color: colorPalette.text
              } : {}}
            >
              <div className="flex items-center space-x-3">
                {wallpaper.featured && (
                  <span 
                    className="px-2 py-1 bg-primary text-background text-xs font-mono font-bold border border-foreground"
                    style={colorPalette ? {
                      backgroundColor: colorPalette.accent,
                      color: colorPalette.text,
                      borderColor: colorPalette.primary
                    } : {}}
                  >
                    FEATURED
                  </span>
                )}
                <h2 
                  className="text-xl font-bold font-mono uppercase tracking-wide"
                  style={colorPalette ? { color: colorPalette.text } : {}}
                >
                  {wallpaper.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 border-2 border-foreground bg-background hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5"
                style={colorPalette ? {
                  borderColor: colorPalette.primary,
                  backgroundColor: colorPalette.background,
                  color: colorPalette.text
                } : {}}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="flex-1 relative bg-black flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
                {(!imageLoaded || isExtractingColors) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
                        style={colorPalette ? { borderColor: colorPalette.primary, borderTopColor: 'transparent' } : {}}
                      ></div>
                      {isExtractingColors && (
                        <div 
                          className="text-sm font-mono text-primary"
                          style={colorPalette ? { color: colorPalette.primary } : {}}
                        >
                          Analyzing colors...
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <Image
                  src={wallpaper.thumbnailPath}
                  alt={wallpaper.title}
                  fill
                  priority
                  unoptimized={wallpaper.thumbnailPath.startsWith('blob:')}
                  className={cn(
                    "object-contain transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoadingComplete={() => setImageLoaded(true)}
                />
                
                {/* Image Overlay Actions */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <motion.button
                    onClick={onToggleFavorite}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-background/90 border-2 border-foreground hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                  >
                    <motion.div
                      animate={isFavorite ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -10, 10, 0]
                      } : {}}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      {isFavorite ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        </motion.div>
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                    </motion.div>
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-background/90 border-2 border-foreground hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Details Panel */}
              <div 
                className="w-full lg:w-80 border-l-0 lg:border-l-2 border-foreground bg-card"
                style={colorPalette ? {
                  borderColor: colorPalette.primary,
                  backgroundColor: colorPalette.background
                } : {}}
              >
                {/* Tab Navigation */}
                <div 
                  className="flex border-b-2 border-foreground"
                  style={colorPalette ? { borderColor: colorPalette.primary } : {}}
                >
                  <button
                    onClick={() => setActiveTab('details')}
                    className={cn(
                      "flex-1 px-4 py-3 font-mono font-bold uppercase tracking-wide transition-all duration-200",
                      activeTab === 'details'
                        ? "bg-primary text-background"
                        : "bg-card hover:bg-primary hover:text-background"
                    )}
                    style={colorPalette ? (activeTab === 'details' ? {
                      backgroundColor: colorPalette.primary,
                      color: colorPalette.text
                    } : {
                      backgroundColor: colorPalette.background,
                      color: colorPalette.text
                    }) : {}}
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => setActiveTab('info')}
                    className={cn(
                      "flex-1 px-4 py-3 font-mono font-bold uppercase tracking-wide transition-all duration-200 border-l-2 border-foreground",
                      activeTab === 'info'
                        ? "bg-primary text-background"
                        : "bg-card hover:bg-primary hover:text-background"
                    )}
                    style={colorPalette ? {
                      borderColor: colorPalette.primary,
                      ...(activeTab === 'info' ? {
                        backgroundColor: colorPalette.primary,
                        color: colorPalette.text
                      } : {
                        backgroundColor: colorPalette.background,
                        color: colorPalette.text
                      })
                    } : {}}
                  >
                    INFO
                  </button>
                </div>

                {/* Tab Content */}
                <div 
                  className="p-6 space-y-6 max-h-[500px] overflow-y-auto font-medium"
                  style={colorPalette ? { 
                    color: colorPalette.text,
                    textShadow: colorPalette.text === '#1a1a1a' ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
                  } : {}}
                >
                  {activeTab === 'details' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-full btn-brutalist px-6 py-4 text-lg font-bold flex items-center justify-center space-x-2"
                        style={colorPalette ? {
                          backgroundColor: colorPalette.accent,
                          borderColor: colorPalette.primary,
                          color: colorPalette.text,
                          boxShadow: `4px 4px 0px 0px ${colorPalette.primary}`
                        } : {}}
                      >
                        <ArrowDownTrayIcon className="w-6 h-6" />
                        <span>DOWNLOAD</span>
                      </button>

                      {/* Resolution & Size */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          SPECIFICATIONS
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                          <div>
                            <span className="text-foreground/70">Resolution:</span>
                            <div className="font-bold">{wallpaper.resolution}</div>
                          </div>
                          <div>
                            <span className="text-foreground/70">Aspect:</span>
                            <div className="font-bold">{(wallpaper.width / wallpaper.height).toFixed(2)}:1</div>
                          </div>
                          <div>
                            <span className="text-foreground/70">Width:</span>
                            <div className="font-bold">{wallpaper.width}px</div>
                          </div>
                          <div>
                            <span className="text-foreground/70">Height:</span>
                            <div className="font-bold">{wallpaper.height}px</div>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          CATEGORY
                        </h3>
                        <span className="inline-block px-3 py-1 bg-primary text-background font-mono font-bold uppercase text-sm border border-foreground">
                          {wallpaper.category}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          TAGS
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {wallpaper.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-background border border-foreground text-xs font-mono uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'info' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Stats */}
                      <div className="space-y-4">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          STATISTICS
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 border border-foreground">
                            <div className="text-2xl font-bold font-mono text-primary">
                              {wallpaper.downloads.toLocaleString()}
                            </div>
                            <div className="text-xs font-mono uppercase text-foreground/70">
                              Downloads
                            </div>
                          </div>
                          <div className="text-center p-3 border border-foreground">
                            <div className="text-2xl font-bold font-mono text-secondary">
                              {wallpaper.views.toLocaleString()}
                            </div>
                            <div className="text-xs font-mono uppercase text-foreground/70">
                              Views
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          FILE INFORMATION
                        </h3>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Format:</span>
                            <span className="font-bold">JPG</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Quality:</span>
                            <span className="font-bold">High</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Size:</span>
                            <span className="font-bold">~2.5 MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">ID:</span>
                            <span className="font-bold">#{wallpaper.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Usage Rights */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          USAGE RIGHTS
                        </h3>
                        <div className="text-sm text-foreground/80 space-y-2">
                          <p>✓ Personal use allowed</p>
                          <p>✓ Commercial use allowed</p>
                          <p>✓ Modification allowed</p>
                          <p>✗ Redistribution prohibited</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
