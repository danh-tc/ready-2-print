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

export default function ItemsHandler() {
  const [images, setImages] = useState<(UploadedImage | undefined)[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  const image = useImpositionStore((s) => s.image);
  const paper = useImpositionStore((s) => s.paper);
  const meta = useImpositionStore((s) => s.meta);

  const layout = calculateGridLayout(paper, image);
  const slotsPerSheet = layout.rows * layout.cols;

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

  const handleSlotAddImage = (slotIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const newImage: UploadedImage = {
        src: reader.result as string,
        name: file.name,
        file,
      };
      setImages((prevImages) => {
        const baseIndex = currentSheet * slotsPerSheet;
        const newImages = [...prevImages];
        while (newImages.length < baseIndex + slotsPerSheet)
          newImages.push(undefined);
        newImages[baseIndex + slotIdx] = newImage;
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSlotRemoveImage = (slotIdx: number) => {
    setImages((prevImages) => {
      const baseIndex = currentSheet * slotsPerSheet;
      const newImages = [...prevImages];
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

  const hydrated = useHydrated();
  if (!hydrated) return null;

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
      <CropperModal
        isOpen={cropModal.open}
        imageSrc={cropModal.src || ""}
        onClose={() =>
          setCropModal({
            open: false,
            slotIdx: null,
            src: null,
          })
        }
        onConfirm={({ dataUrl, crop }) => {
          if (cropModal.slotIdx === null) return;
          const baseIndex = currentSheet * slotsPerSheet;
          const newImages = [...images];
          const oldImage = newImages[baseIndex + cropModal.slotIdx];
          if (!oldImage) return;

          newImages[baseIndex + cropModal.slotIdx] = {
            ...oldImage,
            src: dataUrl, // ✅ Use new cropped image
            crop, // ✅ Save crop metadata
          };
          setImages(newImages);
          setCropModal({ open: false, slotIdx: null, src: null });
        }}
      />
    </div>
  );
}
