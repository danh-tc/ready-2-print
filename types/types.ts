// The per-slot image data
export interface SlotImage {
  src: string; // The original uploaded image (DataURL or URL)
  name: string; // File name
  file?: File; // Optional: keep for download
  crop?: CropSettings; // User's cropping & transform data for this slot
}

// The crop settings as returned by cropper.getData()
export interface CropSettings {
  x: number; // crop left (in image px)
  y: number; // crop top (in image px)
  width: number; // crop width (in image px)
  height: number; // crop height (in image px)
  rotate: number; // degrees
  scaleX: number; // usually 1 or -1 (flip)
  scaleY: number; // usually 1 or -1 (flip)
}
