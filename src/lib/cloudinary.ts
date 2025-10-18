import crypto from "node:crypto";

import { formatVoidwallzId, slugify } from "@/lib/utils";

type CloudinaryConfig = {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

function ensureCloudinaryConfig() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not defined");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

function getAuthHeader(apiKey: string, apiSecret: string) {
  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  return `Basic ${token}`;
}

export type CloudinaryListOptions = {
  maxResults?: number;
  nextCursor?: string;
  folder?: string;
  prefix?: string;
};

export type CloudinaryResource = {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  tags: string[];
  folder?: string;
  [key: string]: unknown;
};

export type CloudinaryListResponse = {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count?: number;
};

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

type UploadOptions = {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
};

export async function uploadWallpaperBuffer({
  buffer,
  mimeType,
  filename,
  options = {},
}: {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
  options?: UploadOptions;
}): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();

  const folder = options.folder ?? "voidwallz/uploads";
  const publicId =
    options.publicId ?? slugify(filename ?? `voidwallz-${Date.now()}`);
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string> = {
    folder,
    public_id: publicId,
    timestamp: timestamp.toString(),
  };

  if (options.overwrite) {
    paramsToSign.overwrite = "true";
  }

  const signaturePayload = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(signaturePayload + apiSecret)
    .digest("hex");

  const uploadUrl = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  );

  const formData = new FormData();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
  formData.append(
    "file",
    new Blob([arrayBuffer], { type: mimeType }),
    filename ?? publicId,
  );
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  if (options.overwrite) {
    formData.append("overwrite", "true");
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response
      .text()
      .catch(() => "Unable to read error body");
    throw new Error(
      `Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  const payload = (await response.json()) as {
    public_id: string;
    secure_url: string;
    bytes: number;
    width: number;
    height: number;
    format: string;
  };

  return {
    publicId: payload.public_id,
    secureUrl: payload.secure_url,
    width: payload.width,
    height: payload.height,
    bytes: payload.bytes,
    format: payload.format,
  };
}

export async function listCloudinaryWallpapers(
  options: CloudinaryListOptions = {},
): Promise<CloudinaryListResponse> {
  if (!isCloudinaryConfigured()) {
    console.warn("Cloudinary environment variables are not configured");
    return { resources: [], next_cursor: undefined, total_count: 0 };
  }

  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();

  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
  );

  url.searchParams.set("max_results", String(options.maxResults ?? 20));
  url.searchParams.set("resource_type", "image");
  url.searchParams.set("type", "upload");

  if (options.nextCursor) {
    url.searchParams.set("next_cursor", options.nextCursor);
  }

  if (options.folder) {
    const normalizedFolder = options.folder.endsWith("/")
      ? options.folder
      : `${options.folder}/`;
    url.searchParams.set("prefix", normalizedFolder);
  } else if (options.prefix) {
    url.searchParams.set("prefix", options.prefix);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(apiKey, apiSecret),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response
      .text()
      .catch(() => "Unable to read error body");
    throw new Error(
      `Failed to fetch Cloudinary resources: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  const data = (await response.json()) as CloudinaryListResponse;

  return {
    resources: data.resources ?? [],
    next_cursor: data.next_cursor,
    total_count: data.total_count,
  };
}

export type CloudinarySearchOptions = {
  maxResults?: number;
  nextCursor?: string;
};

// Attempt to extract a Cloudinary public_id from a secure URL
// Example: https://res.cloudinary.com/<cloud>/image/upload/v1712345678/folder/name.jpg
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname; // /<cloud>/image/upload/v123/folder/name.jpg -> we want folder/name
    // Remove anything up to and including '/upload/'
    const uploadIdx = path.indexOf("/upload/");
    if (uploadIdx === -1) return null;
    let rest = path.slice(uploadIdx + "/upload/".length);
    // Strip optional version segment like v1234567/
    rest = rest.replace(/^v\d+\//, "");
    // Drop extension
    rest = rest.replace(/\.[a-zA-Z0-9]+$/, "");
    // Remove leading slash
    return rest.replace(/^\//, "") || null;
  } catch {
    return null;
  }
}

export async function searchCloudinaryFolder(
  folder: string,
  options: CloudinarySearchOptions = {},
): Promise<CloudinaryListResponse> {
  if (!isCloudinaryConfigured()) {
    console.warn("Cloudinary environment variables are not configured");
    return { resources: [], next_cursor: undefined, total_count: 0 };
  }

  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();

  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
  );

  const body = {
    // Match images directly in the folder and any nested subfolders
    expression: `(resource_type:image OR (resource_type:raw AND format:svg)) AND (folder="${folder}" OR public_id:"${folder}/*")`,
    max_results: options.maxResults ?? 100,
    next_cursor: options.nextCursor,
    with_field: ["tags", "context", "metadata"],
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(apiKey, apiSecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response
      .text()
      .catch(() => "Unable to read error body");
    throw new Error(
      `Failed to search Cloudinary resources: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  const data = (await response.json()) as CloudinaryListResponse;

  return {
    resources: data.resources ?? [],
    next_cursor: data.next_cursor,
    total_count: data.total_count,
  };
}

export type NormalizedCloudinaryWallpaper = {
  id: string;
  displayId: string;
  title: string;
  slug: string;
  thumbnailPath: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  tags: string[];
  category: string;
  createdAt: string;
  resolution: string;
  folder?: string;
};

export type GenerateArchiveOptions = {
  flattenFolders?: boolean;
  useOriginalFilename?: boolean;
  targetPublicId?: string; // name of output archive
};

// Ask Cloudinary to generate a ZIP archive and return a direct download URL.
// This uses the Admin API and requires API key/secret.
export async function generateCloudinaryZip(
  publicIds: string[],
  opts: GenerateArchiveOptions = {},
): Promise<{ url: string; expiresAt?: string }> {
  if (!publicIds.length) {
    throw new Error("No public_ids provided");
  }
  const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();
  const endpoint = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/generate_archive`,
  );

  const body: Record<string, any> = {
    public_ids: publicIds,
    target_format: "zip",
    flatten_folders: opts.flattenFolders ?? true,
    use_original_filename: opts.useOriginalFilename ?? true,
  };
  if (opts.targetPublicId) body.target_public_id = opts.targetPublicId;

  const res = await fetch(endpoint.toString(), {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(apiKey, apiSecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Cloudinary generate_archive failed: ${res.status} ${res.statusText} ${errText}`,
    );
  }

  const data = (await res.json()) as {
    url?: string;
    archive_url?: string;
    expires_at?: string;
  };
  const url = data.url || data.archive_url;
  if (!url) throw new Error("Cloudinary did not return an archive URL");
  return { url, expiresAt: data.expires_at };
}

function formatTitle(publicId: string) {
  const name = publicId.split("/").pop() ?? publicId;
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeCloudinaryResource(
  resource: CloudinaryResource,
  index = 0,
): NormalizedCloudinaryWallpaper {
  const title = formatTitle(resource.public_id);
  const folderCategory = resource.folder
    ? resource.folder.split("/").pop()
    : undefined;
  const primaryTag = Array.isArray(resource.tags)
    ? resource.tags[0]
    : undefined;

  // Start with Cloudinary tags (if any)
  const tags: string[] = Array.isArray(resource.tags) ? [...resource.tags] : [];

  // Pull custom context and structured metadata if present
  const ctx =
    (resource as unknown as { context?: { custom?: Record<string, unknown> } })
      .context?.custom || {};
  const meta =
    (resource as unknown as { metadata?: Record<string, unknown> }).metadata ||
    {};

  // Merge in comma- or pipe-separated tag strings from context/metadata keys named "tags"
  const tagStrings: Array<unknown> = [];
  if (typeof (ctx as any).tags === "string") tagStrings.push((ctx as any).tags);
  if (typeof (meta as any).tags === "string")
    tagStrings.push((meta as any).tags);
  for (const s of tagStrings) {
    if (typeof s === "string") {
      s.split(/[,|]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => {
          if (!tags.includes(t)) tags.push(t);
        });
    }
  }

  // Feature flag via context/metadata keys
  const featureKeys = ["featured", "feature", "is_featured", "isFeatured"];
  const isTrue = (v: unknown) =>
    v === true ||
    v === 1 ||
    v === "1" ||
    (typeof v === "string" && v.toLowerCase() === "true");
  for (const k of featureKeys) {
    if (isTrue((ctx as any)[k]) || isTrue((meta as any)[k])) {
      if (!tags.map((t) => t.toLowerCase()).includes("featured"))
        tags.push("featured");
      break;
    }
  }

  // Category override via context/metadata if provided
  const catOverrideRaw = (ctx as any).category ?? (meta as any).category;
  const category = (
    catOverrideRaw && typeof catOverrideRaw === "string"
      ? catOverrideRaw
      : folderCategory || primaryTag || "general"
  ).toLowerCase();

  return {
    id: resource.asset_id ?? resource.public_id,
    displayId: formatVoidwallzId(index),
    title,
    slug: slugify(resource.public_id),
    thumbnailPath: resource.secure_url ?? resource.url,
    width:
      resource.width && resource.width > 0
        ? resource.width
        : resource.format.toLowerCase() === "svg" ||
            resource.resource_type === "raw"
          ? 1440
          : resource.width,
    height:
      resource.height && resource.height > 0
        ? resource.height
        : resource.format.toLowerCase() === "svg" ||
            resource.resource_type === "raw"
          ? 2560
          : resource.height,
    bytes: resource.bytes,
    format: resource.format,
    tags,
    category,
    createdAt: resource.created_at,
    resolution: `${resource.width && resource.width > 0 ? resource.width : resource.format.toLowerCase() === "svg" || resource.resource_type === "raw" ? 1440 : resource.width}x${resource.height && resource.height > 0 ? resource.height : resource.format.toLowerCase() === "svg" || resource.resource_type === "raw" ? 2560 : resource.height}`,
    folder: resource.folder,
  };
}

// Build a transformation string segment from normalized options
export type TransformOptions = {
  width?: number;
  height?: number;
  aspectRatio?: string;
  fit?: "fill" | "pad" | "fit";
  gravity?: "auto" | "auto:subject" | "face" | "center";
  format?: "auto" | "jpg" | "png" | "webp" | "avif";
  quality?: "auto" | number;
  saturation?: number; // -100..100
  hue?: number; // -100..100
  brightness?: number; // -100..100
  contrast?: number; // -100..100
  tint?: { amount: number; color: string }; // e_tint:amount:color
};

export function buildTransformation(opts: TransformOptions): string {
  const parts: string[] = [];
  const mapFit: Record<string, string> = {
    fill: "c_fill",
    pad: "c_pad",
    fit: "c_fit",
  };
  if (opts.fit) parts.push(mapFit[opts.fit]);
  if (opts.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts.height) parts.push(`h_${Math.round(opts.height)}`);
  if (opts.aspectRatio) parts.push(`ar_${opts.aspectRatio}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);
  parts.push(`f_${opts.format ?? "auto"}`);
  parts.push(`q_${typeof opts.quality === "number" ? opts.quality : "auto"}`);
  if (typeof opts.saturation === "number")
    parts.push(`e_saturation:${opts.saturation}`);
  if (typeof opts.hue === "number") parts.push(`e_hue:${opts.hue}`);
  if (typeof opts.brightness === "number")
    parts.push(`e_brightness:${opts.brightness}`);
  if (typeof opts.contrast === "number")
    parts.push(`e_contrast:${opts.contrast}`);
  if (opts.tint) parts.push(`e_tint:${opts.tint.amount}:${opts.tint.color}`);
  return parts.join(",");
}

export function buildCloudinaryUrl(
  publicId: string,
  opts: TransformOptions = {},
): string {
  const { cloudName } = ensureCloudinaryConfig();
  const t = buildTransformation(opts);
  const encodedPublicId = encodeURIComponent(publicId);
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
  return t ? `${base}/${t}/${encodedPublicId}` : `${base}/${encodedPublicId}`;
}
