import { Suspense } from "react";
import GalleryClient from "../gallery/gallery-client";
import { normalizeCloudinaryResource, searchCloudinaryFolder } from "@/lib/cloudinary";
import RequireAuth from "@/components/auth/require-auth";

export const revalidate = 0;

export default async function FeedPage() {
  const desktopFolder = process.env.CLOUDINARY_DESKTOP_FOLDER || "wallpapers desktop";
  const mobileFolder = process.env.CLOUDINARY_MOBILE_FOLDER || "wallpapers phone";

  const [desktop, mobile] = await Promise.all([
    searchCloudinaryFolder(desktopFolder, { maxResults: 120 }),
    searchCloudinaryFolder(mobileFolder, { maxResults: 120 }),
  ]);

  const desktopNorm = desktop.resources.map((r, i) => normalizeCloudinaryResource(r, i));
  const mobileNorm = mobile.resources.map((r, i) => normalizeCloudinaryResource(r, i));

  const baseWallpapers = [
    ...desktopNorm.map((n) => ({
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
    })),
    ...mobileNorm.map((n) => ({
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
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading feed…</div>}>
      {/* @ts-expect-error Server component embedding client guard */}
      <RequireAuth>
        <GalleryClient baseWallpapers={baseWallpapers} title="FEED" initialDevice="all" />
      </RequireAuth>
    </Suspense>
  );
}
