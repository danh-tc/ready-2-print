"use client";

import React, { useMemo } from "react";
import { calculateGridLayout } from "@/lib/layoutCalculator";
import { ImageCell } from "./ImageCell";
import "./paper-preview.scss";
import { Crop, X } from "lucide-react";
import { ImageConfig, PaperConfig, UploadedImage } from "@/types/types";

interface Props {
  paper: PaperConfig;
  image: ImageConfig;
  customerName?: string;
  date?: string;
  description?: string;
  showMeta?: boolean;
  images?: (UploadedImage | undefined)[];
  allowSlotImageUpload?: boolean;
  onSlotAddImage?: (slotIdx: number, file: File) => void;
  onSlotRemoveImage?: (slotIdx: number) => void;
  onSlotEditImage?: (slotIdx: number) => void;
}

export const PaperPreview: React.FC<Props> = ({
  paper,
  image,
  customerName,
  date,
  description,
  images,
  allowSlotImageUpload = false,
  onSlotAddImage,
  onSlotRemoveImage,
  onSlotEditImage,
}) => {
  const PREVIEW_W = 500;
  const aspect = paper.height / paper.width;
  const previewWidth = PREVIEW_W;
  const previewHeight = PREVIEW_W * aspect;
  const scale = previewWidth / paper.width;

  const layout = useMemo(
    () => calculateGridLayout(paper, image),
    [paper, image]
  );

  const margin = {
    top: paper.margin.top * scale,
    right: paper.margin.right * scale,
    bottom: paper.margin.bottom * scale,
    left: paper.margin.left * scale,
  };
  const gap = {
    horizontal: paper.gap.horizontal * scale,
    vertical: paper.gap.vertical * scale,
  };
  const cellWidth = image.width * scale;
  const cellHeight = image.height * scale;

  const usableW = previewWidth - margin.left - margin.right;
  const usableH = previewHeight - margin.top - margin.bottom;
  const gridW = layout.cols * cellWidth + (layout.cols - 1) * gap.horizontal;
  const gridH = layout.rows * cellHeight + (layout.rows - 1) * gap.vertical;
  const gridOffsetX = (usableW - gridW) / 2;
  const gridOffsetY = (usableH - gridH) / 2;

  return (
    <div
      className="rethink-paper-preview"
      style={{
        width: previewWidth, // dynamic
        height: previewHeight, // dynamic
      }}
    >
      {/* Margin box: top/left/size dynamic */}
      <div
        className="rethink-paper-preview__margin"
        style={{
          top: margin.top,
          left: margin.left,
          width: previewWidth - margin.left - margin.right,
          height: previewHeight - margin.top - margin.bottom,
        }}
      />

      {/* Grid: position + size + templates/gaps dynamic */}
      <div
        className="rethink-paper-preview__grid"
        style={{
          top: margin.top + gridOffsetY,
          left: margin.left + gridOffsetX,
          width: gridW,
          height: gridH,
          gridTemplateRows: `repeat(${layout.rows}, ${cellHeight}px)`,
          gridTemplateColumns: `repeat(${layout.cols}, ${cellWidth}px)`,
          gap: `${gap.vertical}px ${gap.horizontal}px`,
        }}
      >
        {Array.from({ length: layout.rows }).flatMap((_, r) =>
          Array.from({ length: layout.cols }).map((__, c) => {
            const idx = r * layout.cols + c;
            return (
              <ImageCell
                key={`${r}-${c}`}
                width={cellWidth}
                height={cellHeight}
              >
                {images && images[idx] ? (
                  <div className="rethink-image-slot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={images[idx].src} alt={images[idx].name} />
                    <div className="rethink-image-slot__actions">
                      <button
                        className="rethink-image-slot__action-btn rethink-image-slot__action-btn--crop"
                        title="Crop"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotEditImage?.(idx);
                        }}
                      >
                        <Crop size={22} strokeWidth={2} />
                      </button>
                      <button
                        className="rethink-image-slot__action-btn rethink-image-slot__action-btn--remove"
                        title="Remove"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotRemoveImage?.(idx);
                        }}
                      >
                        <X size={22} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ) : allowSlotImageUpload && onSlotAddImage ? (
                  <label className="rethink-image-slot rethink-image-slot--upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onSlotAddImage(idx, file);
                      }}
                    />
                    <span className="rethink-image-slot__add-icon">＋</span>
                  </label>
                ) : (
                  <div className="rethink-image-slot rethink-image-slot--placeholder" />
                )}
              </ImageCell>
            );
          })
        )}
      </div>

      {(customerName || date || description) && (
        <div
          className="rethink-paper-preview__meta"
          style={{
            paddingLeft: margin.left,
            paddingRight: margin.right,
            height: margin.bottom || "fit-content",
          }}
        >
          <div className="rethink-paper-preview__meta-left">
            {date} - {customerName} - {description}
          </div>
        </div>
      )}
    </div>
  );
};
