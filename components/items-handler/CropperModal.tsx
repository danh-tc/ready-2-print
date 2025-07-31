"use client";

import React, { useRef, useEffect, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./cropper-modal.scss";

import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Undo2,
  X,
  Check,
} from "lucide-react";
import { CropSettings } from "@/types/types";

interface CropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (result: { dataUrl: string; crop: CropSettings }) => void;
}

export const CropperModal: React.FC<CropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Reset "loaded" state when opening
  useEffect(() => {
    if (isOpen) setLoaded(false);
  }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Click outside modal to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Toolbar actions
  const zoomIn = () => cropperRef.current?.cropper.zoom(0.1);
  const zoomOut = () => cropperRef.current?.cropper.zoom(-0.1);
  const rotateLeft = () => cropperRef.current?.cropper.rotate(-90);
  const rotateRight = () => cropperRef.current?.cropper.rotate(90);
  const reset = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    cropper.reset();
    cropper.clear();
    cropper.crop();
  };

  // Confirm crop and return data
  const handleConfirm = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const data = cropper.getData();
    const imageData = cropper.getImageData();

    const crop: CropSettings = {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      rotate: data.rotate,
      scaleX: data.scaleX,
      scaleY: data.scaleY,
      naturalWidth: imageData.naturalWidth,
      naturalHeight: imageData.naturalHeight,
    };

    onConfirm({ dataUrl, crop });
  };

  if (!isOpen) return null;

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal" ref={modalRef}>
        <div className="cropper-header">
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
            Cancel
          </button>
          <div className="cropper-title">Crop Photo 2×3</div>
          <button
            className="btn-icon confirm"
            onClick={handleConfirm}
            disabled={!loaded}
          >
            <Check size={20} />
            Confirm
          </button>
        </div>

        <div className="cropper-body">
          <Cropper
            src={imageSrc}
            style={{ height: 400, width: "100%" }}
            aspectRatio={2 / 3}
            guides={true}
            viewMode={1}
            dragMode="move"
            autoCropArea={1}
            background={false}
            responsive={true}
            checkOrientation={false}
            onInitialized={(instance) => {
              setLoaded(true);
            }}
            ref={cropperRef}
          />
        </div>

        <div className="cropper-toolbar">
          <button onClick={zoomOut}>
            <ZoomOut size={20} /> Shrink
          </button>
          <button onClick={zoomIn}>
            <ZoomIn size={20} /> Enlarge
          </button>
          <button onClick={rotateLeft}>
            <RotateCcw size={20} /> Rotate Left
          </button>
          <button onClick={rotateRight}>
            <RotateCw size={20} /> Rotate Right
          </button>
          <button onClick={reset}>
            <Undo2 size={20} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};
