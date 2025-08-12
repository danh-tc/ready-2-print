import React, { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import "./bulk-image-uploader.scss";
import type { UploadedImage } from "@/types/types";
import { rotateIfNeeded } from "@/lib/rotateIfNeeded";
import { autoCoverCrop } from "@/lib/autoCoverCrop";

interface BulkImageUploaderProps {
  onImagesLoaded: (images: UploadedImage[]) => void;
  maxImages?: number;
  label?: string;
  uploadedImages?: (UploadedImage | undefined)[];
  onClearAll?: () => void;
  /** NEW: slot size to fit (in mm). If provided, images are auto-cropped like 'cover'. */
  targetSizeMm?: { width: number; height: number };
  /** NEW: output DPI for the auto-cropped image (default 300). */
  dpi?: number;
  /** NEW: image output format for auto-crop. */
  output?: { type: "image/jpeg" | "image/png"; quality?: number };
}

export const BulkImageUploader: React.FC<BulkImageUploaderProps> = ({
  onImagesLoaded,
  maxImages = 30,
  label = "Bulk Select & Arrange Images",
  uploadedImages = [],
  onClearAll,
  targetSizeMm,
  dpi = 300,
  output = { type: "image/png" },
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (files.length > maxImages) {
      alert(`Please select no more than ${maxImages} images.`);
      return;
    }

    const images: UploadedImage[] = [];
    for (const file of files) {
      const dataUrl = await readAsDataURL(file);

      // ✅ Rotate if needed before crop
      let orientedSrc = dataUrl;
      if (targetSizeMm) {
        orientedSrc = await rotateIfNeeded(
          dataUrl,
          targetSizeMm.width,
          targetSizeMm.height,
          dpi
        );
      }

      let workingSrc = orientedSrc;
      let crop: UploadedImage["crop"] | undefined;

      if (targetSizeMm) {
        const { dataUrl: autoUrl, crop: autoCrop } = await autoCoverCrop(
          orientedSrc,
          targetSizeMm,
          dpi,
          output
        );
        workingSrc = autoUrl;
        crop = autoCrop;
      }

      images.push({
        originalSrc: orientedSrc,
        src: workingSrc,
        name: file.name,
        file,
        crop,
      });
    }

    onImagesLoaded(images);
    e.target.value = "";
  };

  return (
    <div className="bulk-image-uploader">
      <button
        className="rethink-btn rethink-btn--outline rethink-btn--md"
        type="button"
        onClick={handleButtonClick}
      >
        <span className="icon-left">
          <Upload size={14} strokeWidth={2} />
        </span>
        <span className="label">{label}</span>
        {uploadedImages.length > 0 && onClearAll && (
          <span
            className="icon-right"
            onClick={(e) => {
              e.stopPropagation();
              onClearAll();
            }}
            title="Clear all images"
          >
            <Trash2 size={18} strokeWidth={1.5} />
          </span>
        )}
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </button>
      <div className="bulk-image-uploader__hint">
        Uploaded: <b>{uploadedImages.filter(Boolean).length}</b>
        {maxImages && <span> / {maxImages}</span>}
      </div>
    </div>
  );
};

function readAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
