import React, { useRef } from "react";
import { Upload, Trash2 } from "lucide-react"; // swap icons as you wish
import "./bulk-image-uploader.scss";

export interface UploadedImage {
  src: string;
  name: string;
  file?: File;
  crop?: import("@/types/types").CropSettings;
}

interface BulkImageUploaderProps {
  onImagesLoaded: (images: UploadedImage[]) => void;
  maxImages?: number;
  label?: string;
  uploadedImages?: (UploadedImage | undefined)[];
  onClearAll?: () => void;
}

export const BulkImageUploader: React.FC<BulkImageUploaderProps> = ({
  onImagesLoaded,
  maxImages = 30,
  label = "Bulk Select & Arrange Images",
  uploadedImages = [],
  onClearAll,
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

    const readPromises = files.map(
      (file) =>
        new Promise<UploadedImage>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              src: reader.result as string,
              name: file.name,
              file,
            });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    const images = await Promise.all(readPromises);
    onImagesLoaded(images);
    e.target.value = "";
  };

  return (
    <div className="bulk-image-uploader">
      <button
        className="bulk-image-uploader__soft-btn"
        type="button"
        onClick={handleButtonClick}
      >
        <span className="icon-left">
          <Upload size={20} strokeWidth={2} />
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
