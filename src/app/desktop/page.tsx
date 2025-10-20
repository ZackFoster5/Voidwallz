import { Suspense } from "react";
import GalleryClient from "../gallery/gallery-client";
import { normalizeCloudinaryResource, searchCloudinaryFolder } from "@/lib/cloudinary";
import RequireAuth from "@/components/auth/require-auth";
import { listLocalWallpapers } from "@/lib/local-wallpapers";

export const revalidate = 0;

export default async function DesktopPage() {
  const folder = process.env.CLOUDINARY_DESKTOP_FOLDER || "wallpapers desktop";
  const result = await searchCloudinaryFolder(folder, { maxResults: 120 });
  let normalized = result.resources.map((r, i) => normalizeCloudinaryResource(r, i));

  // Fallback to local public assets if Cloudinary returns no results
  if (normalized.length === 0) {
    const local = await listLocalWallpapers('desktop', 120)
    normalized = local.map((n, i) => ({
      id: n.id,
      displayId: n.displayId,
      title: n.title,
      slug: n.slug,
      thumbnailPath: n.thumbnailPath,
      width: n.width,
      height: n.height,
      bytes: n.bytes,
      format: n.format,
      tags: n.tags,
      category: n.category,
      createdAt: n.createdAt,
      resolution: n.resolution,
      folder: n.folder,
    }))
  }

  const baseWallpapers = normalized.map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    thumbnailPath: n.thumbnailPath,
    width: n.width,
    height: n.height,
    category: n.category,
    tags: n.tags,
    downloads: 0,
    views: 0,
    featured: (n.tags ?? []).some(t => ['featured','feature'].includes(t.toLowerCase())),
    resolution: n.resolution,
    deviceType: "desktop" as const,
    createdAt: n.createdAt,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading desktop gallery…</div>}>
      <RequireAuth>
        <GalleryClient baseWallpapers={baseWallpapers} fixedDevice="desktop" title="DESKTOP" />
      </RequireAuth>
    </Suspense>
  );
}
