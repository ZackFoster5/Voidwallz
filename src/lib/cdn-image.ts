// Utilities to build fast Cloudinary delivery URLs directly from secure URLs
// Works on the client without needing environment variables.

export function withCloudinaryTransform(
  url: string,
  transform: string,
): string {
  try {
    if (
      !url ||
      !url.includes("res.cloudinary.com") ||
      !url.includes("/upload/") ||
      url.includes("/raw/upload/")
    ) {
      return url;
    }
    // Insert the transformation right after '/upload/'
    return url.replace("/upload/", `/upload/${transform}/`);
  } catch {
    return url;
  }
}

function isSvgUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return /\.svg$/i.test(path);
  } catch {
    return /\.svg(\?|$)/i.test(url);
  }
}

export function gridThumbUrl(
  url: string,
  device: "desktop" | "mobile" = "desktop",
): string {
  // Lean, highly compressed thumbnails for grid
  const base = "f_auto,q_auto:eco,dpr_auto,c_fill,g_auto";
  const size = device === "mobile" ? "w_600" : "w_800";
  const sanitize = isSvgUrl(url) ? ",fl_sanitize" : "";
  return withCloudinaryTransform(url, `${base},${size}${sanitize}`);
}

export function previewImageUrl(
  url: string,
  device: "desktop" | "mobile" = "desktop",
): string {
  // Larger but still optimized for the modal preview
  const base = "f_auto,q_auto:good,dpr_auto,c_fit,g_auto";
  const size = device === "mobile" ? "w_1100" : "w_1600";
  const sanitize = isSvgUrl(url) ? ",fl_sanitize" : "";
  return withCloudinaryTransform(url, `${base},${size}${sanitize}`);
}
