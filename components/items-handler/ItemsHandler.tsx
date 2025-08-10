"use client";

import React, { useState } from "react";
import { BulkImageUploader } from "@/components/items-handler/BulkImageUploader";
import { PaperPreview } from "../layout/PaperPreview";
import { calculateGridLayout } from "@/lib/layoutCalculator";
import { useImpositionStore } from "@/store/useImpositionStore";
import { SheetPaginator } from "./SheetPaginator";
import { useHydrated } from "@/hooks/useImpositionHydrated";
import { CropSettings, UploadedImage } from "@/types/types";
import { CropperModal } from "./CropperModal";
import { exportImpositionPdf } from "@/lib/exportImpositionPdf";
import { autoCoverCrop } from "@/lib/autoCoverCrop";
import { rotateIfNeeded } from "@/lib/rotateIfNeeded";

export default function ItemsHandler() {
  const [images, setImages] = useState<(UploadedImage | undefined)[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  const image = useImpositionStore((s) => s.image); // slot size in mm
  const paper = useImpositionStore((s) => s.paper);
  const meta = useImpositionStore((s) => s.meta);

  // Calculate grid
  const layout = calculateGridLayout(paper, image);
  const slotsPerSheet = layout.rows * layout.cols;

  // Build sheets
  const sheets: (UploadedImage | undefined)[][] = [];
  for (let i = 0; i < images.length; i += slotsPerSheet) {
    sheets.push(images.slice(i, i + slotsPerSheet));
  }
  if (sheets.length === 0) {
    sheets.push(Array(slotsPerSheet).fill(undefined));
  } else if (sheets[sheets.length - 1].length < slotsPerSheet) {
    sheets[sheets.length - 1] = [
      ...sheets[sheets.length - 1],
      ...Array(slotsPerSheet - sheets[sheets.length - 1].length).fill(
        undefined
      ),
    ];
  }

  const [cropModal, setCropModal] = useState<{
    open: boolean;
    slotIdx: number | null;
    src: string | null;
    initialCrop?: CropSettings;
  }>({ open: false, slotIdx: null, src: null });

  // open crop modal — always from original
  const handleSlotEditImage = (slotIdx: number) => {
    const baseIndex = currentSheet * slotsPerSheet;
    const img = images[baseIndex + slotIdx];
    if (!img) return;
    setCropModal({
      open: true,
      slotIdx,
      src: img.originalSrc, // ✅ start from original for fresh crop
      initialCrop: img.crop, // optional (you can ignore if you always reset)
    });
  };

  const handleSlotAddImage = (slotIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      const orientedSrc = await rotateIfNeeded(
        dataUrl,
        image.width,
        image.height,
        300
      );

      const { dataUrl: autoUrl, crop } = await autoCoverCrop(
        orientedSrc,
        { width: image.width, height: image.height },
        300,
        { type: "image/png" }
      );

      const newImage: UploadedImage = {
        originalSrc: orientedSrc,
        src: autoUrl,
        name: file.name,
        file,
        crop,
      };

      setImages((prevImages) => {
        const baseIndex = currentSheet * slotsPerSheet;
        const next = [...prevImages];
        while (next.length < baseIndex + slotsPerSheet) next.push(undefined);
        next[baseIndex + slotIdx] = newImage;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSlotRemoveImage = (slotIdx: number) => {
    setImages((prevImages) => {
      const baseIndex = currentSheet * slotsPerSheet;
      const next = [...prevImages];
      if (next[baseIndex + slotIdx]) next[baseIndex + slotIdx] = undefined;
      return next;
    });
  };

  const handleClearAllUploadedImages = () => {
    setImages([]);
    setCurrentSheet(0);
  };

  const handleExportPdf = async () => {
    const pdfBytes = await exportImpositionPdf({
      paper,
      image,
      sheets, // all pages
      layout,
      customerName: meta.customerName,
      description: meta.description,
      date: meta.date,
      cutMarkLengthMm: 3,
      cutMarkThicknessPt: 0.7,
      cutMarkColor: { r: 0, g: 0, b: 0 },
    });
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const hydrated = useHydrated();
  if (!hydrated) return null;

  return (
    <div>
      <BulkImageUploader
        onImagesLoaded={(newImgs) => {
          // append to existing grid slots (left-to-right)
          setImages((prev) => {
            const merged = [...prev];
            for (let i = 0; i < newImgs.length; i++) {
              // find first empty slot
              const emptyIndex = merged.findIndex((x) => x === undefined);
              if (emptyIndex !== -1) merged[emptyIndex] = newImgs[i];
              else merged.push(newImgs[i]);
            }
            return merged;
          });
        }}
        maxImages={30}
        label="Upload your images"
        uploadedImages={images}
        onClearAll={handleClearAllUploadedImages}
        // NEW: tell uploader the slot size so it can auto-cover
        targetSizeMm={{ width: image.width, height: image.height }}
        dpi={300}
        output={{ type: "image/png" }} // or JPEG for smaller PDFs
      />

      <SheetPaginator
        totalSheets={sheets.length}
        currentSheet={currentSheet}
        onChange={setCurrentSheet}
      />

      <PaperPreview
        paper={paper}
        image={image}
        customerName={meta.customerName}
        description={meta.description}
        images={sheets[currentSheet] || []}
        date={meta.date}
        allowSlotImageUpload
        onSlotAddImage={handleSlotAddImage}
        onSlotRemoveImage={handleSlotRemoveImage}
        onSlotEditImage={handleSlotEditImage}
      />

      {cropModal.open && cropModal.src && (
        <CropperModal
          imageData={image}
          isOpen={cropModal.open}
          imageSrc={cropModal.src}
          onClose={() =>
            setCropModal({ open: false, slotIdx: null, src: null })
          }
          onConfirm={({ dataUrl, crop }) => {
            if (cropModal.slotIdx === null) return;
            const baseIndex = currentSheet * slotsPerSheet;
            const next = [...images];
            const old = next[baseIndex + cropModal.slotIdx];
            if (!old) return;

            next[baseIndex + cropModal.slotIdx] = {
              ...old,
              src: dataUrl, // replace working image with user crop
              crop,
            };
            setImages(next);
            setCropModal({ open: false, slotIdx: null, src: null });
          }}
        />
      )}

      <button onClick={handleExportPdf}>Export PDF</button>
    </div>
  );
}
