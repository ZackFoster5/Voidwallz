import GalleryClient from "../gallery/gallery-client";
import { normalizeCloudinaryResource, searchCloudinaryFolder } from "@/lib/cloudinary";

export const revalidate = 0;

export default async function DesktopPage() {
  const result = await searchCloudinaryFolder("wallpapers desktop", { maxResults: 120 });
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
    <GalleryClient baseWallpapers={baseWallpapers} fixedDevice="desktop" title="DESKTOP" />
  );
}
