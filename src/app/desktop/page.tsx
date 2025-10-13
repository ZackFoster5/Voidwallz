import { Suspense } from "react";
import GalleryClient from "../gallery/gallery-client";
import { normalizeCloudinaryResource, searchCloudinaryFolder } from "@/lib/cloudinary";
import RequireAuth from "@/components/auth/require-auth";

export const revalidate = 0;

export default async function DesktopPage() {
  const folder = process.env.CLOUDINARY_DESKTOP_FOLDER || "wallpapers desktop";
  const result = await searchCloudinaryFolder(folder, { maxResults: 120 });
  const normalized = result.resources.map((r, i) => normalizeCloudinaryResource(r, i));

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
    featured: false,
    resolution: n.resolution,
    deviceType: "desktop" as const,
    createdAt: n.createdAt,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading desktop gallery…</div>}>
      {/* @ts-expect-error Server component embedding client guard */}
      <RequireAuth>
        <GalleryClient baseWallpapers={baseWallpapers} fixedDevice="desktop" title="DESKTOP" />
      </RequireAuth>
    </Suspense>
  );
}
