import React, { useMemo } from "react";
import {
  calculateGridLayout,
  PaperConfig,
  ImageConfig,
} from "@/lib/layoutCalculator";
import { ImageCell } from "./ImageCell";
import "./paper-preview.scss";

interface Props {
  paper: PaperConfig;
  image: ImageConfig;
  customerName?: string;
  date?: string;
  description?: string;
  showMeta?: boolean;
}

export const PaperPreview: React.FC<Props> = ({
  paper,
  image,
  customerName,
  date,
  description,
}) => {
  const PREVIEW_MAX_W = 500;
  const aspect = paper.height / paper.width;
  const previewWidth = PREVIEW_MAX_W;
  const previewHeight = PREVIEW_MAX_W * aspect;
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

  const cells: React.ReactNode[] = [];
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      cells.push(
        <ImageCell key={`${row}-${col}`} width={cellWidth} height={cellHeight}>
          <div className="img-placeholder" />
        </ImageCell>
      );
    }
  }

  return (
    <div
      className="paper-preview"
      style={{
        width: previewWidth,
        height: previewHeight,
        position: "relative",
        background: "#f9f9f9",
        border: "2px solid #888",
        boxSizing: "border-box",
      }}
    >
      <div
        className="paper-preview__margin"
        style={{
          position: "absolute",
          top: margin.top,
          left: margin.left,
          width: previewWidth - margin.left - margin.right,
          height: previewHeight - margin.top - margin.bottom,
          border: "2px dashed #bbb",
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      />
      <div
        className="paper-preview__grid"
        style={{
          position: "absolute",
          top: margin.top + gridOffsetY,
          left: margin.left + gridOffsetX,
          width: gridW,
          height: gridH,
          display: "grid",
          gridTemplateRows: `repeat(${layout.rows}, ${cellHeight}px)`,
          gridTemplateColumns: `repeat(${layout.cols}, ${cellWidth}px)`,
          gap: `${gap.vertical}px ${gap.horizontal}px`,
          pointerEvents: "none",
        }}
      >
        {cells}
      </div>
      {/* Meta info on edge */}
      {(customerName || date || description) && (
        <div
          className="paper-preview__meta"
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            bottom: 0,
            height: margin.bottom,
            display: "flex",
            alignItems: "center",
            paddingLeft: margin.left,
            paddingRight: margin.right,
            color: "#373737",
            boxSizing: "border-box",
            zIndex: 3,
            pointerEvents: "none",
            letterSpacing: "0.02em",
          }}
        >
          <div style={{ flex: 1, fontWeight: 600 }}>{customerName}</div>
          <div style={{ flex: 2, textAlign: "center" }}>{description}</div>
          <div style={{ flex: 1, textAlign: "right" }}>{date}</div>
        </div>
      )}
    </div>
  );
};
