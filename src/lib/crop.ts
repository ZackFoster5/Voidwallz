import { TransformOptions, buildCloudinaryUrl } from '@/lib/cloudinary'
import type { DeviceProfile } from '@/types/premium'

export function bestCropOptionsForDevice(device: Pick<DeviceProfile,'width'|'height'>): TransformOptions {
  const w = Math.max(1, Math.round(device.width))
  const h = Math.max(1, Math.round(device.height))
  // Let Cloudinary choose the subject; fill to avoid letterboxing
  return {
    width: w,
    height: h,
    fit: 'fill',
    gravity: 'auto:subject',
    quality: 'auto',
    format: 'auto',
  }
}

export function bestCropUrl(publicId: string, device: Pick<DeviceProfile,'width'|'height'>) {
  const opts = bestCropOptionsForDevice(device)
  return buildCloudinaryUrl(publicId, opts)
}
