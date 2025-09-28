export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  textSecondary: string
}

interface RGB {
  r: number
  g: number
  b: number
}

// Convert RGB to HSL for better color analysis
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

// Convert HSL back to RGB
function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  if (s === 0) {
    const gray = Math.round(l * 255)
    return { r: gray, g: gray, b: gray }
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
  const g = Math.round(hue2rgb(p, q, h) * 255)
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255)

  return { r, g, b }
}

// Create soft, eye-friendly version of a color
function createSoftColor(color: RGB, isDark: boolean): RGB {
  const [h, s, l] = rgbToHsl(color.r, color.g, color.b)
  
  // Reduce saturation for softer colors (max 60% for comfort)
  const softSaturation = Math.min(s * 0.7, 60)
  
  // Adjust lightness for eye comfort
  let softLightness: number
  if (isDark) {
    // For dark mode: keep colors muted and not too bright
    softLightness = Math.max(Math.min(l, 45), 25)
  } else {
    // For light mode: keep colors soft and not too dark
    softLightness = Math.max(Math.min(l, 75), 35)
  }
  
  return hslToRgb(h, softSaturation, softLightness)
}

// Calculate luminance for contrast checking
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Check if color provides good contrast
function hasGoodContrast(color1: RGB, color2: RGB): boolean {
  const lum1 = getLuminance(color1.r, color1.g, color1.b)
  const lum2 = getLuminance(color2.r, color2.g, color2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05) >= 4.5
}

// K-means clustering for color extraction
function kMeansColors(pixels: RGB[], k: number = 5): RGB[] {
  if (pixels.length === 0) return []

  // Initialize centroids randomly
  let centroids: RGB[] = []
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)]
    centroids.push({ ...randomPixel })
  }

  let iterations = 0
  const maxIterations = 20

  while (iterations < maxIterations) {
    // Assign pixels to nearest centroid
    const clusters: RGB[][] = Array(k).fill(null).map(() => [])
    
    pixels.forEach(pixel => {
      let minDistance = Infinity
      let closestCentroid = 0
      
      centroids.forEach((centroid, index) => {
        const distance = Math.sqrt(
          Math.pow(pixel.r - centroid.r, 2) +
          Math.pow(pixel.g - centroid.g, 2) +
          Math.pow(pixel.b - centroid.b, 2)
        )
        
        if (distance < minDistance) {
          minDistance = distance
          closestCentroid = index
        }
      })
      
      clusters[closestCentroid].push(pixel)
    })

    // Update centroids
    const newCentroids: RGB[] = []
    clusters.forEach(cluster => {
      if (cluster.length > 0) {
        const avgR = cluster.reduce((sum, p) => sum + p.r, 0) / cluster.length
        const avgG = cluster.reduce((sum, p) => sum + p.g, 0) / cluster.length
        const avgB = cluster.reduce((sum, p) => sum + p.b, 0) / cluster.length
        newCentroids.push({ r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) })
      } else {
        newCentroids.push(centroids[newCentroids.length])
      }
    })

    // Check for convergence
    let converged = true
    for (let i = 0; i < k; i++) {
      if (
        Math.abs(centroids[i].r - newCentroids[i].r) > 1 ||
        Math.abs(centroids[i].g - newCentroids[i].g) > 1 ||
        Math.abs(centroids[i].b - newCentroids[i].b) > 1
      ) {
        converged = false
        break
      }
    }

    centroids = newCentroids
    if (converged) break
    iterations++
  }

  return centroids
}

// Extract colors from image
export async function extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Resize for performance
        const maxSize = 150
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels: RGB[] = []

        // Sample pixels (every 4th pixel for performance)
        for (let i = 0; i < imageData.data.length; i += 16) {
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          const a = imageData.data[i + 3]

          // Skip transparent pixels and very dark/light pixels
          if (a > 128 && r + g + b > 30 && r + g + b < 720) {
            pixels.push({ r, g, b })
          }
        }

        if (pixels.length === 0) {
          // Fallback colors
          resolve({
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#f59e0b',
            background: '#1f2937',
            text: '#ffffff',
            textSecondary: '#d1d5db'
          })
          return
        }

        // Extract dominant colors
        const dominantColors = kMeansColors(pixels, 6)
        
        // Sort by saturation and lightness for better color selection
        const sortedColors = dominantColors
          .map(color => {
            const [h, s, l] = rgbToHsl(color.r, color.g, color.b)
            return { ...color, h, s, l }
          })
          .sort((a, b) => (b.s * b.l) - (a.s * a.l))

        // Select colors for different purposes
        const rawPrimary = sortedColors[0] || { r: 59, g: 130, b: 246 }
        const rawSecondary = sortedColors[1] || { r: 139, g: 92, b: 246 }
        const rawAccent = sortedColors[2] || { r: 245, g: 158, b: 11 }

        // Determine if we need light or dark theme
        const avgLuminance = dominantColors.reduce((sum, color) => 
          sum + getLuminance(color.r, color.g, color.b), 0) / dominantColors.length

        const isDark = avgLuminance < 0.4 // Slightly adjusted threshold

        // Create soft, eye-friendly versions of colors
        const primary = createSoftColor(rawPrimary, isDark)
        const secondary = createSoftColor(rawSecondary, isDark)
        const accent = createSoftColor(rawAccent, isDark)

        // Create gentle background color
        const backgroundBase = createSoftColor(rawPrimary, isDark)
        const backgroundRgb = isDark 
          ? `rgb(${Math.max(backgroundBase.r - 60, 12)}, ${Math.max(backgroundBase.g - 60, 12)}, ${Math.max(backgroundBase.b - 60, 12)})`
          : `rgb(${Math.min(backgroundBase.r + 80, 248)}, ${Math.min(backgroundBase.g + 80, 248)}, ${Math.min(backgroundBase.b + 80, 248)})`

        // Create palette with soft, eye-friendly colors
        const palette: ColorPalette = {
          primary: `rgb(${primary.r}, ${primary.g}, ${primary.b})`,
          secondary: `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`,
          accent: `rgb(${accent.r}, ${accent.g}, ${accent.b})`,
          background: backgroundRgb,
          text: isDark ? '#f8fafc' : '#1e293b',
          textSecondary: isDark ? '#cbd5e1' : '#475569'
        }

        resolve(palette)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      // Fallback colors - soft and eye-friendly
      resolve({
        primary: '#6366f1', // Softer indigo
        secondary: '#8b5cf6', // Muted purple  
        accent: '#f59e0b', // Warm amber
        background: '#f8fafc', // Very light gray
        text: '#1e293b', // Soft dark gray
        textSecondary: '#475569' // Medium gray
      })
    }

    img.src = imageUrl
  })
}

// Generate CSS custom properties from palette
export function generateCSSVariables(palette: ColorPalette): Record<string, string> {
  return {
    '--color-dynamic-primary': palette.primary,
    '--color-dynamic-secondary': palette.secondary,
    '--color-dynamic-accent': palette.accent,
    '--color-dynamic-background': palette.background,
    '--color-dynamic-text': palette.text,
    '--color-dynamic-text-secondary': palette.textSecondary,
  }
}
