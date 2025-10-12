import { Suspense } from "react";
import GalleryClient from "../gallery/gallery-client";
import { normalizeCloudinaryResource, searchCloudinaryFolder } from "@/lib/cloudinary";

export const revalidate = 0;

export default async function PhonePage() {
  const folder = process.env.CLOUDINARY_MOBILE_FOLDER || "wallpapers phone";
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
    deviceType: "mobile" as const,
    createdAt: n.createdAt,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading phone gallery…</div>}>
      <GalleryClient baseWallpapers={baseWallpapers} fixedDevice="mobile" title="PHONE" />
    </Suspense>
  );
}
