#!/usr/bin/env tsx
/**
 * Auto-tag existing Cloudinary wallpapers with AI-generated metadata
 * 
 * This script:
 * 1. Fetches all wallpapers from Cloudinary folders
 * 2. Analyzes each with Gemini AI to generate tags, category, description
 * 3. Updates Cloudinary resources with the generated metadata
 * 
 * Usage: npm run auto-tag [--force] [--folder=path]
 *   --force: Re-tag wallpapers even if they already have tags
 *   --folder: Only process specific folder (e.g., "wallpapers desktop")
 */

import { z } from 'zod'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash-exp'

const BATCH_SIZE = 5 // Process 5 at a time to avoid rate limits
const DELAY_MS = 2000 // Delay between batches

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials not configured')
  process.exit(1)
}

if (!GOOGLE_API_KEY) {
  console.error('❌ Google API key not configured')
  process.exit(1)
}

function getAuthHeader() {
  const token = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')
  return `Basic ${token}`
}

const geminiMetadataSchema = z.object({
  tags: z
    .array(z.string().min(1).max(40).transform((v) => v.trim().toLowerCase()))
    .max(10),
  categorySlug: z.string().min(1).max(60),
  confidence: z.number().min(0).max(1).optional(),
})

type CloudinaryResource = {
  asset_id: string
  public_id: string
  secure_url: string
  tags: string[]
  context?: { custom?: Record<string, unknown> }
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

async function listAllWallpapers(folder: string): Promise<CloudinaryResource[]> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`
  const expression = `resource_type:image AND (folder="${folder}" OR public_id:"${folder}/*")`
  
  let allResources: CloudinaryResource[] = []
  let nextCursor: string | undefined

  do {
    const body = {
      expression,
      max_results: 100,
      next_cursor: nextCursor,
      with_field: ['tags', 'context', 'metadata'],
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Failed to list wallpapers: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as { resources: CloudinaryResource[]; next_cursor?: string }
    allResources = allResources.concat(data.resources)
    nextCursor = data.next_cursor
  } while (nextCursor)

  return allResources
}

async function analyzeWithGemini(imageUrl: string): Promise<z.infer<typeof geminiMetadataSchema>> {
  // Fetch image as base64
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`)
  }
  
  const arrayBuffer = await imageResponse.arrayBuffer()
  const base64Image = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

  const prompt = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are an assistant that inspects wallpaper artwork and returns structured metadata.
Return JSON with keys: tags (3-8 entries), categorySlug (kebab-case), confidence (0-1).
Tags must be lowercase single words or hyphenated phrases describing the image content, mood, colors, and style.
Category slug should best match one of: nature, abstract, gaming, cars, space, minimalist, vibes, cities, minimal-cards, anime, nature-portrait, cyberpunk, fantasy, or suggest a new slug if none fits.`,
          },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    }
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Gemini request failed: ${response.status} - ${errorText}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) {
    throw new Error('Gemini response missing content')
  }

  return geminiMetadataSchema.parse(JSON.parse(raw))
}

async function updateCloudinaryResource(
  publicId: string,
  metadata: { tags: string[]; category: string }
): Promise<void> {
  // Update tags via explicit API
  const tagsUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload/tags`
  const tagsBody = {
    public_ids: [publicId],
    tags: metadata.tags,
    command: 'set_exclusive', // Replace existing tags
  }

  const tagsResponse = await fetch(tagsUrl, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tagsBody),
  })

  if (!tagsResponse.ok) {
    const err = await tagsResponse.text().catch(() => 'Unknown')
    throw new Error(`Failed to update tags: ${tagsResponse.status} - ${err}`)
  }

  // Update context via explicit API
  const contextUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload/${encodeURIComponent(publicId)}/context`
  
  const contextBody = {
    context: {
      category: metadata.category,
      featured: 'true',
      tags: metadata.tags.join(','),
    },
  }

  const contextResponse = await fetch(contextUrl, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contextBody),
  })

  if (!contextResponse.ok) {
    const err = await contextResponse.text().catch(() => 'Unknown')
    console.warn(`⚠️  Failed to update context for ${publicId}: ${err}`)
  }
}

function needsTagging(resource: CloudinaryResource, force: boolean): boolean {
  if (force) return true
  
  // Check if already has tags
  if (resource.tags && resource.tags.length > 0) return false
  
  // Check if has context metadata
  const ctx = resource.context?.custom
  if (ctx && (ctx.category || ctx.tags)) return false
  
  return true
}

async function processBatch(resources: CloudinaryResource[], force: boolean) {
  const results = {
    total: resources.length,
    processed: 0,
    skipped: 0,
    failed: 0,
  }

  for (let i = 0; i < resources.length; i += BATCH_SIZE) {
    const batch = resources.slice(i, i + BATCH_SIZE)
    
    await Promise.all(
      batch.map(async (resource) => {
        try {
          if (!needsTagging(resource, force)) {
            console.log(`⏭️  Skipping ${resource.public_id} (already tagged)`)
            results.skipped++
            return
          }

          console.log(`🔍 Analyzing ${resource.public_id}...`)
          const metadata = await analyzeWithGemini(resource.secure_url)
          
          console.log(`💾 Updating ${resource.public_id} with tags: ${metadata.tags.join(', ')}`)
          await updateCloudinaryResource(resource.public_id, {
            tags: metadata.tags,
            category: metadata.categorySlug,
          })
          
          results.processed++
          console.log(`✅ Updated ${resource.public_id}`)
        } catch (error) {
          results.failed++
          console.error(`❌ Failed to process ${resource.public_id}:`, error instanceof Error ? error.message : error)
        }
      })
    )

    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < resources.length) {
      console.log(`⏳ Waiting ${DELAY_MS}ms before next batch...`)
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    }
  }

  return results
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const folderArg = args.find((arg) => arg.startsWith('--folder='))
  const folder = folderArg ? folderArg.split('=')[1] : null

  const folders = folder
    ? [folder]
    : [
        process.env.CLOUDINARY_DESKTOP_FOLDER || 'wallpapers desktop',
        process.env.CLOUDINARY_MOBILE_FOLDER || 'wallpapers phone',
      ]

  console.log('🚀 Starting auto-tag process...')
  console.log(`📁 Folders: ${folders.join(', ')}`)
  console.log(`🔄 Force re-tag: ${force ? 'yes' : 'no'}`)
  console.log()

  const allResults = {
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
  }

  for (const folder of folders) {
    console.log(`\n📂 Processing folder: ${folder}`)
    const resources = await listAllWallpapers(folder)
    console.log(`   Found ${resources.length} wallpapers`)

    if (resources.length === 0) {
      console.log('   No wallpapers to process, skipping...')
      continue
    }

    const results = await processBatch(resources, force)
    
    allResults.total += results.total
    allResults.processed += results.processed
    allResults.skipped += results.skipped
    allResults.failed += results.failed
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Final Results:')
  console.log(`   Total wallpapers: ${allResults.total}`)
  console.log(`   ✅ Processed: ${allResults.processed}`)
  console.log(`   ⏭️  Skipped: ${allResults.skipped}`)
  console.log(`   ❌ Failed: ${allResults.failed}`)
  console.log('='.repeat(50))
}

main().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
