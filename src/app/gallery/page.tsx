import { Suspense } from 'react'
import GalleryClient, { type GalleryWallpaper } from './gallery-client'

const mockWallpapers: GalleryWallpaper[] = [
  {
    id: '1',
    title: 'Abstract Geometry',
    slug: 'abstract-geometry',
    thumbnailPath: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=600&fit=crop',
    width: 1920,
    height: 1080,
    category: 'abstract',
    tags: ['geometric', 'colorful', 'modern'],
    downloads: 1250,
    views: 5420,
    featured: true,
    resolution: '1920x1080'
  },
  {
    id: '2',
    title: 'Mountain Vista',
    slug: 'mountain-vista',
    thumbnailPath: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    width: 2560,
    height: 1440,
    category: 'nature',
    tags: ['landscape', 'mountains', 'scenic'],
    downloads: 2100,
    views: 8930,
    featured: false,
    resolution: '2560x1440'
  },
  {
    id: '3',
    title: 'Neon City',
    slug: 'neon-city',
    thumbnailPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    width: 3840,
    height: 2160,
    category: 'gaming',
    tags: ['cyberpunk', 'neon', 'urban'],
    downloads: 890,
    views: 3240,
    featured: true,
    resolution: '4K'
  },
  {
    id: '4',
    title: 'Ocean Waves',
    slug: 'ocean-waves',
    thumbnailPath: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=600&fit=crop',
    width: 1920,
    height: 1080,
    category: 'nature',
    tags: ['ocean', 'waves', 'blue'],
    downloads: 1680,
    views: 6750,
    featured: false,
    resolution: '1920x1080'
  },
  {
    id: '5',
    title: 'Sports Car',
    slug: 'sports-car',
    thumbnailPath: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=600&fit=crop',
    width: 2560,
    height: 1440,
    category: 'cars',
    tags: ['automotive', 'luxury', 'speed'],
    downloads: 945,
    views: 4120,
    featured: false,
    resolution: '2560x1440'
  },
  {
    id: '6',
    title: 'Galaxy Spiral',
    slug: 'galaxy-spiral',
    thumbnailPath: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop',
    width: 3840,
    height: 2160,
    category: 'space',
    tags: ['galaxy', 'stars', 'cosmic'],
    downloads: 1340,
    views: 7890,
    featured: true,
    resolution: '4K'
  },
  {
    id: '7',
    title: 'Minimal Lines',
    slug: 'minimal-lines',
    thumbnailPath: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=600&fit=crop',
    width: 1920,
    height: 1080,
    category: 'minimalist',
    tags: ['minimal', 'clean', 'simple'],
    downloads: 2340,
    views: 9120,
    featured: false,
    resolution: '1920x1080'
  },
  {
    id: '8',
    title: 'Forest Path',
    slug: 'forest-path',
    thumbnailPath: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
    width: 2560,
    height: 1440,
    category: 'nature',
    tags: ['forest', 'path', 'green'],
    downloads: 1890,
    views: 6540,
    featured: true,
    resolution: '2560x1440'
  }
]

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryClient baseWallpapers={mockWallpapers} />
    </Suspense>
  )
}
