"use client";

import {
  BulkImageUploader,
  UploadedImage,
} from "@/components/items-handler/BulkImageUploader";
import { useState } from "react";
import { PaperPreview } from "../layout/PaperPreview";
import { calculateGridLayout } from "@/lib/layoutCalculator";
import { useImpositionStore } from "@/store/useImpositionStore";
import { SheetPaginator } from "./SheetPaginator";
import { useHydrated } from "@/hooks/useImpositionHydrated";
import { CropSettings } from "@/types/types";
import { CropperModal } from "./CropperModal";
import { exportImpositionPdf } from "@/lib/exportImpositionPdf";

export default function ItemsHandler() {
  const [images, setImages] = useState<(UploadedImage | undefined)[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  const image = useImpositionStore((s) => s.image);
  const paper = useImpositionStore((s) => s.paper);
  const meta = useImpositionStore((s) => s.meta);

  // Calculate grid layout and how many slots per sheet
  const layout = calculateGridLayout(paper, image);
  const slotsPerSheet = layout.rows * layout.cols;

  // Split images into sheets (array of arrays)
  const sheets: (UploadedImage | undefined)[][] = [];
  for (let i = 0; i < images.length; i += slotsPerSheet) {
    sheets.push(images.slice(i, i + slotsPerSheet));
  }
  // Ensure at least one sheet exists for adding images per slot
  if (sheets.length === 0) {
    sheets.push(Array(slotsPerSheet).fill(undefined));
  } else if (sheets[sheets.length - 1].length < slotsPerSheet) {
    // Pad the last sheet with undefined for empty slots
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

  const handleSlotEditImage = (slotIdx: number) => {
    const baseIndex = currentSheet * slotsPerSheet;
    const img = images[baseIndex + slotIdx];
    if (!img) return;
    setCropModal({
      open: true,
      slotIdx,
      src: img.src,
      initialCrop: img.crop,
    });
  };

  // Handler for per-slot image upload
  const handleSlotAddImage = (slotIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const newImage: UploadedImage = {
        src: reader.result as string,
        name: file.name,
        file,
      };
      setImages((prevImages) => {
        // Compute where in the global images array this slot falls
        const baseIndex = currentSheet * slotsPerSheet;
        // Ensure array is long enough for all possible slots
        const newImages = [...prevImages];
        while (newImages.length < baseIndex + slotsPerSheet)
          newImages.push(undefined);
        newImages[baseIndex + slotIdx] = newImage;
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  // Handler for per-slot image remove
  const handleSlotRemoveImage = (slotIdx: number) => {
    setImages((prevImages) => {
      const baseIndex = currentSheet * slotsPerSheet;
      const newImages = [...prevImages];
      // Only clear if slot exists (prevent errors)
      if (newImages[baseIndex + slotIdx]) {
        newImages[baseIndex + slotIdx] = undefined;
      }
      return newImages;
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
      sheets, // all sheets (pages)
      layout,
      customerName: meta.customerName,
      description: meta.description,
      date: meta.date,
      cutMarkLengthMm: 3, // e.g. 3mm cut marks (default)
      cutMarkThicknessPt: 0.7, // e.g. slightly thicker line
      cutMarkColor: { r: 0, g: 0, b: 0 }, // black lines
    });
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const hydrated = useHydrated();
  if (!hydrated) return null; // Ensure the component only renders after hydration

  return (
    <div>
      <BulkImageUploader
        onImagesLoaded={setImages}
        maxImages={30}
        label="Upload your images"
        uploadedImages={images}
        onClearAll={handleClearAllUploadedImages}
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
        allowSlotImageUpload={true}
        onSlotAddImage={handleSlotAddImage}
        onSlotRemoveImage={handleSlotRemoveImage}
        onSlotEditImage={handleSlotEditImage}
      />
      {cropModal.open && cropModal.src && (
        <CropperModal
          src={cropModal.src}
          aspectRatio={image.width / image.height} // pass slot ratio here!
          initialCrop={cropModal.initialCrop}
          onCancel={() =>
            setCropModal({ open: false, slotIdx: null, src: null })
          }
          onCrop={({ dataUrl, cropSettings }) => {
            // Save new crop settings and/or preview image for the slot
            setImages((prev) => {
              const baseIdx = currentSheet * slotsPerSheet;
              const newImages = [...prev];
              if (cropModal.slotIdx !== null) {
                const old = newImages[baseIdx + cropModal.slotIdx];
                newImages[baseIdx + cropModal.slotIdx] = old
                  ? { ...old, src: old.src, crop: cropSettings } // Store crop settings!
                  : { src: dataUrl, name: "cropped", crop: cropSettings };
              }
              return newImages;
            });
            setCropModal({ open: false, slotIdx: null, src: null });
          }}
        />
      )}
      <button onClick={handleExportPdf}>Export PDF</button>
    </div>
  );
}
