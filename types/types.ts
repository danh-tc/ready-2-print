// The per-slot image data
export interface SlotImage {
  src: string; // The original uploaded image (DataURL or URL)
  name: string; // File name
  file?: File; // Optional: keep for download
  crop?: CropSettings; // User's cropping & transform data for this slot
}

// The crop settings as returned by cropper.getData()
export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface PaperConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  gap: {
    horizontal: number;
    vertical: number;
  };
}

export interface ImageConfig {
  width: number;
  height: number;
}

export interface LayoutConfig {
  rows: number;
  cols: number;
}

export interface MetaInfo {
  customerName?: string;
  description?: string;
  date?: string;
}

export interface UploadedImage {
  originalSrc: string;
  src: string; 
  name: string;
  file?: File;
  crop?: CropSettings;
}
