"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { type ColorPalette } from "@/lib/color-extractor";
import { previewImageUrl } from "@/lib/cdn-image";

interface Wallpaper {
  id: string;
  title: string;
  slug: string;
  thumbnailPath: string;
  width: number;
  height: number;
  category: string;
  tags: string[];
  downloads: number;
  views: number;
  featured: boolean;
  resolution: string;
  deviceType?: "desktop" | "mobile";
}

interface WallpaperPreviewModalProps {
  wallpaper: Wallpaper | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function WallpaperPreviewModal({
  wallpaper,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: WallpaperPreviewModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "info">("details");
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Lock scroll in place while the modal is open without jumping to top
  const savedScrollRef = useRef<number | null>(null);
  useEffect(() => {
    if (isOpen) {
      savedScrollRef.current = window.scrollY;
      // Hide scrollbars but keep layout and scroll position
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      // Restore overflow and scroll to where we left off
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      if (savedScrollRef.current !== null) {
        window.scrollTo({ top: savedScrollRef.current });
      }
    }
    return () => {
      // Ensure restoration on unmount
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Disable dynamic color extraction for higher contrast and consistency
  useEffect(() => {
    setIsExtractingColors(false);
    setColorPalette(null);
  }, [wallpaper?.id, isOpen]);

  // Fallback: resolve spinner if the image never finishes loading
  useEffect(() => {
    if (!isOpen || !wallpaper?.thumbnailPath) return;
    setImageError(false);
    const id = window.setTimeout(() => {
      setImageError(true);
      setImageLoaded(true);
    }, 8000);
    return () => window.clearTimeout(id);
  }, [isOpen, wallpaper?.thumbnailPath]);

  if (!wallpaper) return null;

  const isDesktop =
    (wallpaper.deviceType ??
      (wallpaper.width >= wallpaper.height ? "desktop" : "mobile")) ===
    "desktop";
  const aspectClass = isDesktop ? "aspect-[16/9]" : "aspect-[9/16]";

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Build a safe filename and preserve original extension (supports SVG); default to jpg
      const baseName = `${wallpaper.slug || wallpaper.title}`.replace(
        /[^a-z0-9-_]+/gi,
        "_",
      );
      const path = wallpaper.thumbnailPath || "";
      const m = path.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
      let ext = (m?.[1] || "").toLowerCase();
      if (ext === "jpeg") ext = "jpg";
      if (!["jpg", "png", "webp", "avif", "svg"].includes(ext)) ext = "jpg";
      const filename = `${baseName}.${ext}`;
      const url = `/api/download?url=${encodeURIComponent(wallpaper.thumbnailPath)}&filename=${encodeURIComponent(filename)}`;

      const res = await fetch(url);
      if (!res.ok) {
        // Fallback: direct link if proxy fails (e.g., content-type or host quirks)
        const a = document.createElement("a");
        a.href = wallpaper.thumbnailPath;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setIsDownloading(false);
        return;
      }

      if (!res.body) {
        // Fallback: open direct link if streaming not available
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setIsDownloading(false);
        return;
      }

      const contentType =
        res.headers.get("content-type") || "application/octet-stream";
      const total = Number(res.headers.get("content-length") || 0);

      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value.slice().buffer);
          received += value.length;
          if (total > 0) {
            setDownloadProgress(
              Math.min(100, Math.round((received / total) * 100)),
            );
          } else {
            // Indeterminate; show pseudo-progress up to 90%
            setDownloadProgress((prev) => Math.min(90, prev + 1));
          }
        }
      }

      const blob = new Blob(chunks, { type: contentType });
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      setDownloadProgress(100);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 600);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${wallpaper.title} - Voidwallz`,
      text: `Check out this amazing ${wallpaper.category} wallpaper: ${wallpaper.title}`,
      url: `${window.location.origin}/wallpaper/${wallpaper.slug}`,
    };

    try {
      // Use native Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        // You could show a toast notification here
        console.log("Link copied to clipboard!");
      }
    } catch (error) {
      console.log("Error sharing:", error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        console.log("Link copied to clipboard!");
      } catch {
        console.log("Could not copy to clipboard");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[95vw] max-w-[1400px] max-h-[94vh] bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-3 border-b-2 border-foreground bg-card"
              style={
                colorPalette
                  ? {
                      backgroundColor: colorPalette.background,
                      borderColor: colorPalette.primary,
                      color: colorPalette.text,
                    }
                  : {}
              }
            >
              <div className="flex items-center space-x-3">
                {wallpaper.featured && (
                  <span
                    className="px-2 py-1 bg-primary text-background text-xs font-mono font-bold border border-foreground"
                    style={
                      colorPalette
                        ? {
                            backgroundColor: colorPalette.accent,
                            color: colorPalette.text,
                            borderColor: colorPalette.primary,
                          }
                        : {}
                    }
                  >
                    FEATURED
                  </span>
                )}
                <h2
                  className="text-xl font-bold font-mono uppercase tracking-wide"
                  style={colorPalette ? { color: colorPalette.text } : {}}
                >
                  {wallpaper.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 border-2 border-foreground bg-background hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5"
                style={
                  colorPalette
                    ? {
                        borderColor: colorPalette.primary,
                        backgroundColor: colorPalette.background,
                        color: colorPalette.text,
                      }
                    : {}
                }
              >
                <Icon name="x-mark" className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="flex-1 relative bg-background flex items-center justify-center min-h-[420px] lg:min-h-[560px] py-0">
                {/* Download progress */}
                {isDownloading && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[80%] max-w-xl">
                    <div className="border-2 border-foreground bg-card p-2 shadow-[3px_3px_0px_0px_var(--color-foreground)]">
                      <div className="text-xs font-mono uppercase tracking-wide mb-1">
                        Downloading… {downloadProgress}%
                      </div>
                      <div className="h-2 bg-background border border-foreground">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {(!imageLoaded || isExtractingColors) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-3 py-2 border-2 border-foreground bg-card text-foreground font-mono text-xs uppercase tracking-wide shadow-[2px_2px_0px_0px_var(--color-foreground)]">
                      Failed to load preview
                    </div>
                  </div>
                )}
                <div
                  className={cn("relative w-full max-h-[85vh]", aspectClass)}
                >
                  <Image
                    src={wallpaper.thumbnailPath}
                    alt={wallpaper.title}
                    fill
                    priority
                    unoptimized
                    style={{ objectFit: "contain" }}
                    className={cn(
                      "object-contain transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0",
                    )}
                    onLoadingComplete={() => setImageLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(true);
                    }}
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>

                {/* Mobile Action Buttons - Always visible at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 lg:hidden">
                  <div className="flex items-center justify-center gap-2 p-3 bg-background/95 backdrop-blur-sm border-t-2 border-foreground">
                    <motion.button
                      onClick={handleDownload}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isDownloading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-foreground bg-primary text-background hover:bg-primary/90 transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)] disabled:opacity-50 font-mono font-bold text-sm uppercase"
                    >
                      <Icon name="download" className="w-5 h-5" />
                      <span>Download</span>
                    </motion.button>
                    <motion.button
                      onClick={onToggleFavorite}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 border-2 border-foreground bg-background hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                    >
                      <motion.div
                        animate={
                          isFavorite
                            ? {
                                scale: [1, 1.3, 1],
                                rotate: [0, -10, 10, 0],
                              }
                            : {}
                        }
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        {isFavorite ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                            }}
                          >
                            <Icon
                              name="heart"
                              className="w-5 h-5 text-red-500"
                            />
                          </motion.div>
                        ) : (
                          <Icon name="heart" className="w-5 h-5" />
                        )}
                      </motion.div>
                    </motion.button>
                    <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 border-2 border-foreground bg-background hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                    >
                      <Icon name="share" className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Details Panel */}
              <div
                className="w-full lg:w-80 lg:max-h-[85vh] overflow-y-auto border-l-0 lg:border-l-2 border-foreground bg-card"
                style={
                  colorPalette
                    ? {
                        borderColor: colorPalette.primary,
                        backgroundColor: colorPalette.background,
                      }
                    : {}
                }
              >
                {/* Tab Navigation */}
                <div
                  className="flex border-b-2 border-foreground"
                  style={
                    colorPalette ? { borderColor: colorPalette.primary } : {}
                  }
                >
                  <button
                    onClick={() => setActiveTab("details")}
                    className={cn(
                      "flex-1 px-4 py-3 font-mono font-bold uppercase tracking-wide transition-all duration-200",
                      activeTab === "details"
                        ? "bg-primary text-background"
                        : "bg-card hover:bg-primary hover:text-background",
                    )}
                    style={
                      colorPalette
                        ? activeTab === "details"
                          ? {
                              backgroundColor: colorPalette.primary,
                              color: colorPalette.text,
                            }
                          : {
                              backgroundColor: colorPalette.background,
                              color: colorPalette.text,
                            }
                        : {}
                    }
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => setActiveTab("info")}
                    className={cn(
                      "flex-1 px-4 py-3 font-mono font-bold uppercase tracking-wide transition-all duration-200 border-l-2 border-foreground",
                      activeTab === "info"
                        ? "bg-primary text-background"
                        : "bg-card hover:bg-primary hover:text-background",
                    )}
                    style={
                      colorPalette
                        ? {
                            borderColor: colorPalette.primary,
                            ...(activeTab === "info"
                              ? {
                                  backgroundColor: colorPalette.primary,
                                  color: colorPalette.text,
                                }
                              : {
                                  backgroundColor: colorPalette.background,
                                  color: colorPalette.text,
                                }),
                          }
                        : {}
                    }
                  >
                    INFO
                  </button>
                </div>

                {/* Tab Content */}
                <div
                  className="p-6 space-y-6 max-h-[72vh] overflow-y-auto font-medium"
                  style={
                    colorPalette
                      ? {
                          color: colorPalette.text,
                          textShadow:
                            colorPalette.text === "#1a1a1a"
                              ? "none"
                              : "0 1px 2px rgba(0,0,0,0.1)",
                        }
                      : {}
                  }
                >
                  {activeTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-full btn-brutalist px-6 py-4 text-lg font-bold flex items-center justify-center space-x-2"
                        style={
                          colorPalette
                            ? {
                                backgroundColor: colorPalette.accent,
                                borderColor: colorPalette.primary,
                                color: colorPalette.text,
                                boxShadow: `4px 4px 0px 0px ${colorPalette.primary}`,
                              }
                            : {}
                        }
                      >
                        <Icon name="download" className="w-6 h-6" />
                        <span>DOWNLOAD</span>
                      </button>

                      {/* Quick actions: Favorite and Share moved from image overlay */}
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={onToggleFavorite}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full p-3 border-2 border-foreground bg-background hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Icon
                              name="heart"
                              className={cn(
                                "w-5 h-5",
                                isFavorite ? "text-red-500" : undefined,
                              )}
                            />
                            <span className="font-mono text-sm">
                              {isFavorite ? "UNFAVORITE" : "FAVORITE"}
                            </span>
                          </div>
                        </motion.button>

                        <motion.button
                          onClick={handleShare}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full p-3 border-2 border-foreground bg-background hover:bg-primary hover:text-background transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-foreground)]"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <Icon name="share" className="w-5 h-5" />
                            <span className="font-mono text-sm">SHARE</span>
                          </div>
                        </motion.button>
                      </div>

                      {/* Resolution & Size */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          SPECIFICATIONS
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                          <div>
                            <span className="text-foreground/70">
                              Resolution:
                            </span>
                            <div className="font-bold">
                              {wallpaper.resolution}
                            </div>
                          </div>
                          <div>
                            <span className="text-foreground/70">Aspect:</span>
                            <div className="font-bold">
                              {(wallpaper.width / wallpaper.height).toFixed(2)}
                              :1
                            </div>
                          </div>
                          <div>
                            <span className="text-foreground/70">Width:</span>
                            <div className="font-bold">{wallpaper.width}px</div>
                          </div>
                          <div>
                            <span className="text-foreground/70">Height:</span>
                            <div className="font-bold">
                              {wallpaper.height}px
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          CATEGORY
                        </h3>
                        <span className="inline-block px-3 py-1 bg-primary text-background font-mono font-bold uppercase text-sm border border-foreground">
                          {wallpaper.category}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          TAGS
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {wallpaper.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-background border border-foreground text-xs font-mono uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "info" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Stats */}
                      <div className="space-y-4">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          STATISTICS
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 border border-foreground">
                            <div className="text-2xl font-bold font-mono text-primary">
                              {wallpaper.downloads.toLocaleString()}
                            </div>
                            <div className="text-xs font-mono uppercase text-foreground/70">
                              Downloads
                            </div>
                          </div>
                          <div className="text-center p-3 border border-foreground">
                            <div className="text-2xl font-bold font-mono text-secondary">
                              {wallpaper.views.toLocaleString()}
                            </div>
                            <div className="text-xs font-mono uppercase text-foreground/70">
                              Views
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          FILE INFORMATION
                        </h3>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Format:</span>
                            <span className="font-bold">JPG</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Quality:</span>
                            <span className="font-bold">High</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">Size:</span>
                            <span className="font-bold">~2.5 MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/70">ID:</span>
                            <span className="font-bold">#{wallpaper.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Usage Rights */}
                      <div className="space-y-3">
                        <h3 className="font-mono font-bold uppercase tracking-wide text-sm border-b border-foreground pb-2">
                          USAGE RIGHTS
                        </h3>
                        <div className="text-sm text-foreground/80 space-y-2">
                          <p>✓ Personal use allowed</p>
                          <p>✓ Commercial use allowed</p>
                          <p>✓ Modification allowed</p>
                          <p>✗ Redistribution prohibited</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
