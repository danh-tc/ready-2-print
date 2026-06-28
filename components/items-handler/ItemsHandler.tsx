"use client";

import "./items-handler.scss";
import React, { useEffect, useState, useMemo } from "react";
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
import ExportQueueDrawer from "./ExportQueueDrawer";
import { useExportQueueStore } from "@/store/useExportQueueStore";
import FullScreenBrandedLoader from "../layout/FullScreenLoader";
import { useLoadingTask } from "@/hooks/useLoadingTask";

export default function ItemsHandler() {
  const [images, setImages] = useState<(UploadedImage | undefined)[]>([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  const image = useImpositionStore((s) => s.image);
  const paper = useImpositionStore((s) => s.paper);
  const meta = useImpositionStore((s) => s.meta);
  const displayMeta = useImpositionStore((s) => s.displayMeta);
  const metaStyle = useImpositionStore((s) => s.metaStyle);

  const { isLoading, runWithLoading } = useLoadingTask();

  const layout = calculateGridLayout(paper, image);
  const slotsPerSheet = layout.rows * layout.cols;

  // --- Derived: do we have any uploaded images at all? ---
  const hasAnyImage = useMemo(() => images.some(Boolean), [images]);

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

  // ===== Export List (Queue) via Zustand + IndexedDB =====
  const queueItems = useExportQueueStore((s) => s.items);
  const hydrateQueue = useExportQueueStore((s) => s.hydrate);
  const addToQueue = useExportQueueStore((s) => s.add);
  const removeFromQueue = useExportQueueStore((s) => s.remove);
  const clearQueue = useExportQueueStore((s) => s.clear);
  const moveQueue = useExportQueueStore((s) => s.move);
  const exportAllQueued = useExportQueueStore((s) => s.exportAll);

  const [isQueueOpen, setIsQueueOpen] = useState(false);

  useEffect(() => {
    hydrateQueue();
  }, [hydrateQueue]);

  // open crop modal — always from original
  const handleSlotEditImage = (slotIdx: number) => {
    const baseIndex = currentSheet * slotsPerSheet;
    const img = images[baseIndex + slotIdx];
    if (!img) return;
    setCropModal({
      open: true,
      slotIdx,
      src: img.originalSrc,
      initialCrop: img.crop,
    });
  };

  const handleSlotAddImage = (slotIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const orientedSrc = await rotateIfNeeded(
        dataUrl,
        image.width - (image?.margin?.left || 0) - (image?.margin?.right || 0),
        image.height - (image?.margin?.top || 0) - (image?.margin?.bottom || 0),
        300
      );

      const { dataUrl: autoUrl, crop } = await autoCoverCrop(
        orientedSrc,
        { width: image.width, height: image.height },
        300,
        { type: "image/png" },
        image.margin
      );

      const newImage: UploadedImage = {
        originalSrc: orientedSrc,
        src: autoUrl,
        name: file.name,
        file,
        crop,
      };

      setImages((prev) => {
        const baseIndex = currentSheet * slotsPerSheet;
        const next = [...prev];
        while (next.length < baseIndex + slotsPerSheet) next.push(undefined);
        next[baseIndex + slotIdx] = newImage;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSlotRemoveImage = (slotIdx: number) => {
    setImages((prev) => {
      const baseIndex = currentSheet * slotsPerSheet;
      const next = [...prev];
      if (next[baseIndex + slotIdx]) next[baseIndex + slotIdx] = undefined;
      return next;
    });
  };

  const handleClearAllUploadedImages = () => {
    setImages([]);
    setCurrentSheet(0);
  };

  const buildCurrentPdfBytes = async () => {
    const pdfBytes = await exportImpositionPdf({
      paper,
      image,
      sheets,
      layout,
      customerName: meta.customerName,
      description: meta.description,
      date: meta.date,
      displayMeta: displayMeta,
      metaX: metaStyle.customPosition ? metaStyle.x : undefined,
      metaY: metaStyle.customPosition ? metaStyle.y : undefined,
      metaFontSize: metaStyle.customPosition ? metaStyle.fontSize : undefined,
      cutMarkLengthMm: 6,
      cutMarkThicknessPt: 0.7,
      cutMarkColor: { r: 0, g: 0, b: 0 },
    });
    return pdfBytes;
  };

  const handleExportPdf = () => {
    if (!hasAnyImage) return; // guard
    return runWithLoading(async () => {
      const pdfBytes = await buildCurrentPdfBytes();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    });
  };

  const handleAddToExportList = () => {
    if (!hasAnyImage) return; // guard
    return runWithLoading(async () => {
      const pdfBytes = await buildCurrentPdfBytes();

      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(pdfBytes);
      const pageCount = doc.getPageCount();

      const name = meta.customerName?.trim() || `Job ${queueItems.length + 1}`;
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      await addToQueue(name, pageCount, blob);
      setIsQueueOpen(true);
    });
  };

  const handleExportAll = () =>
    runWithLoading(async () => {
      const merged = await exportAllQueued();
      if (!merged) return;

      const blob = new Blob([merged], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    });

  const hydrated = useHydrated();
  if (!hydrated) return null;

  const queueView = queueItems.map((i) => ({
    id: i.id,
    name: i.name,
    pageCount: i.pageCount,
    createdAt: i.createdAt,
  }));

  return (
    <div className="rethink-items rethink-container">
      {/* Center paginator */}
      <div className="rethink-paginator-row">
        <SheetPaginator
          totalSheets={sheets.length}
          currentSheet={currentSheet}
          onChange={setCurrentSheet}
        />
      </div>

      {/* === 2-column layout === */}
      <div className="rethink-layout2col">
        {/* LEFT — Preview */}
        <div className="rethink-layout2col__left">
          <div className="rethink-paper">
            <div className="rethink-paper__chip">
              {layout.cols}×{layout.rows} · {paper.width}×{paper.height}mm · Gap{" "}
              {paper.gap.horizontal}/{paper.gap.vertical}mm · Margin{" "}
              {paper.margin.top}/{paper.margin.right}/{paper.margin.bottom}/
              {paper.margin.left}mm
            </div>

            <PaperPreview
              paper={paper}
              image={image}
              customerName={meta.customerName}
              description={meta.description}
              images={sheets[currentSheet] || []}
              date={meta.date}
              allowSlotImageUpload
              PREVIEW_W={800}
              onSlotAddImage={handleSlotAddImage}
              onSlotRemoveImage={handleSlotRemoveImage}
              onSlotEditImage={handleSlotEditImage}
            />
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <aside className="rethink-layout2col__right">
          {/* Row 1: Queue / Export Current / Export All */}
          <div className="sidebar-row sidebar-row--buttons">
            <button
              className="rethink-btn rethink-btn--outline rethink-btn--sm"
              onClick={() => setIsQueueOpen((v) => !v)}
            >
              Queue ({queueItems.length})
            </button>

            <button
              className="rethink-btn rethink-btn--primary rethink-btn--sm"
              disabled={!hasAnyImage}
              onClick={handleExportPdf}
            >
              Export Current
            </button>

            <button
              className="rethink-btn rethink-btn--outline rethink-btn--sm"
              disabled={!queueItems.length}
              onClick={handleExportAll}
            >
              Export All
            </button>
          </div>

          {/* Row 3: Add to Export List */}
          <div className="sidebar-row">
            <button
              className="rethink-btn rethink-btn--outline rethink-btn--md"
              disabled={!hasAnyImage}
              onClick={handleAddToExportList}
            >
              Add to Export List
            </button>
          </div>

          {/* Row 4: Upload Section */}
          <div className="sidebar-row">
            <BulkImageUploader
              label="Upload your images"
              onImagesLoaded={(newImgs) => {
                setImages((prev) => {
                  const merged = [...prev];
                  for (let i = 0; i < newImgs.length; i++) {
                    const emptyIndex = merged.findIndex((x) => x === undefined);
                    if (emptyIndex !== -1) merged[emptyIndex] = newImgs[i];
                    else merged.push(newImgs[i]);
                  }
                  return merged;
                });
              }}
              uploadedImages={images}
              onClearAll={handleClearAllUploadedImages}
              targetSizeMm={{ width: image.width, height: image.height }}
              dpi={300}
              output={{ type: "image/png" }}
              marginMm={image.margin}
            />

            <div className="sidebar-upload-info">
              Uploaded: {images.filter(Boolean).length} <br />
              Queued: {queueItems.length}
            </div>
          </div>

          {/* Row 2: Back to Configuration */}
          <div className="sidebar-row">
            <button
              className="rethink-btn rethink-btn--outline rethink-btn--md rethink-btn--back"
              onClick={() => (window.location.href = "/configuration")}
            >
              Back to Configuration
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16px"
                height="16px"
                viewBox="-19.04 0 75.804 75.804"
              >
                <g
                  id="Group_65"
                  data-name="Group 65"
                  transform="translate(-831.568 -384.448)"
                >
                  <path
                    id="Path_57"
                    data-name="Path 57"
                    d="M833.068,460.252a1.5,1.5,0,0,1-1.061-2.561l33.557-33.56a2.53,2.53,0,0,0,0-3.564l-33.557-33.558a1.5,1.5,0,0,1,2.122-2.121l33.556,33.558a5.53,5.53,0,0,1,0,7.807l-33.557,33.56A1.5,1.5,0,0,1,833.068,460.252Z"
                    fill="#111"
                  />
                </g>
              </svg>
            </button>
          </div>
        </aside>
      </div>

      {/* Crop modal + queue drawer + loader */}
      {cropModal.open && cropModal.src && (
        <CropperModal
          imageData={image}
          dpi={300}
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
              src: dataUrl,
              crop,
            };
            setImages(next);
            setCropModal({ open: false, slotIdx: null, src: null });
          }}
        />
      )}

      <ExportQueueDrawer
        open={isQueueOpen}
        items={queueView}
        onClose={() => setIsQueueOpen(false)}
        onExportAll={handleExportAll}
        onClear={clearQueue}
        onMove={moveQueue}
        onRemove={removeFromQueue}
      />

      <FullScreenBrandedLoader
        open={isLoading}
        text="Please wait a moment. We are currently processing your request."
        backdropColor="#fff"
        textColor="#3a3a3a"
        dotColor="#b8864d"
      />
    </div>
  );
}
