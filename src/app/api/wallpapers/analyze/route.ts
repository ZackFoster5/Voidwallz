import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { uploadWallpaperBuffer } from '@/lib/cloudinary'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB limit for safety
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-preview-09-2025'
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

const geminiMetadataSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(40)
        .transform((value) => value.trim().toLowerCase())
    )
    .max(10),
  categorySlug: z.string().min(1).max(60),
  confidence: z.number().min(0).max(1).optional(),
})

async function callGemini({
  base64Image,
  mimeType,
}: {
  base64Image: string
  mimeType: string
}) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured')
  }

  const prompt = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are an assistant that inspects wallpaper artwork and returns structured metadata.
Return JSON with keys: title, description, tags (3-6 entries), categorySlug (kebab-case), confidence (0-1) indicating your certainty about the category.
Title should be under 100 characters, lowercase words capitalized normally.
Description should be 1 concise sentence (<=200 characters) highlighting mood and subject.
Tags must be lowercase single words or hyphenated phrases.
Category slug should best match one of: nature, abstract, gaming, cars, space, minimalist, vibes, cities, minimal-cards, anime, nature-portrait, or suggest a new slug if none fits.`,
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
    const errorText = await response.text().catch(() => 'Unknown error from Gemini')
    throw new Error(`Gemini request failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) {
    throw new Error('Gemini response missing content')
  }

  const parsed = geminiMetadataSchema.parse(JSON.parse(raw))
  return parsed
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data payload' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File field is required' }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum size of 15MB' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await uploadWallpaperBuffer({
      buffer,
      mimeType: file.type || 'image/png',
      filename: file.name,
      options: {
        folder: 'voidwallz/uploads/tmp',
        overwrite: false,
      },
    })

    const geminiResult = await callGemini({
      base64Image: buffer.toString('base64'),
      mimeType: file.type || 'image/png',
    })

    return NextResponse.json({
      image: uploadResult,
      metadata: geminiResult,
    })
  } catch (error) {
    console.error('[AI wallpaper analyze] failed', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid metadata format from Gemini', details: error.issues }, { status: 502 })
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 })
  }
}
