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

export interface UploadedImage {
  src: string;
  name: string;
  file: File;
  crop?: CropSettings;
}
