// lib/exportImpositionPdf.ts
import { PDFDocument, rgb } from "pdf-lib";

// mm to points helper
const mmToPt = (mm: number) => mm * 2.83465;

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
interface Gap {
  horizontal: number;
  vertical: number;
}
interface ExportImpositionPdfParams {
  paper: { width: number; height: number; margin: Margin; gap: Gap };
  image: { width: number; height: number; margin?: Margin }; // ⬅️ added optional per-image margin
  sheets: Array<Array<{ src: string } | undefined>>; // Each sheet = array of images
  layout: { rows: number; cols: number };
  customerName?: string;
  description?: string;
  date?: string;
  cutMarkLengthMm?: number; // Optional: cut mark length (default 3mm)
  cutMarkThicknessPt?: number; // Optional: cut mark thickness (default 0.5pt)
  cutMarkColor?: { r: number; g: number; b: number }; // Optional: cut mark color (0-255 range)
}

// Draws cut marks (point cuts) at the corners of a rectangle
function drawCutMarks(
  page: import("pdf-lib").PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  cutLenPt = mmToPt(3),
  color: import("pdf-lib").RGB | undefined = undefined, // expects a pdf-lib color object
  thickness: number = 0.5
) {
  // Top-left
  page.drawLine({
    start: { x: x - cutLenPt, y: y + h },
    end: { x, y: y + h },
    color,
    thickness,
  });
  page.drawLine({
    start: { x, y: y + h },
    end: { x, y: y + h + cutLenPt },
    color,
    thickness,
  });
  // Top-right
  page.drawLine({
    start: { x: x + w, y: y + h },
    end: { x: x + w + cutLenPt, y: y + h },
    color,
    thickness,
  });
  page.drawLine({
    start: { x: x + w, y: y + h },
    end: { x: x + w, y: y + h + cutLenPt },
    color,
    thickness,
  });
  // Bottom-left
  page.drawLine({
    start: { x: x - cutLenPt, y },
    end: { x, y },
    color,
    thickness,
  });
  page.drawLine({
    start: { x, y },
    end: { x, y: y - cutLenPt },
    color,
    thickness,
  });
  // Bottom-right
  page.drawLine({
    start: { x: x + w, y },
    end: { x: x + w + cutLenPt, y },
    color,
    thickness,
  });
  page.drawLine({
    start: { x: x + w, y },
    end: { x: x + w, y: y - cutLenPt },
    color,
    thickness,
  });
}

export async function exportImpositionPdf({
  paper,
  image,
  sheets,
  layout,
  customerName,
  description,
  date,
  cutMarkLengthMm = 3,
  cutMarkThicknessPt = 0.5,
  cutMarkColor = { r: 0, g: 0, b: 0 }, // default black (0-255)
}: ExportImpositionPdfParams) {
  const pdfDoc = await PDFDocument.create();

  const rgbColor = rgb(
    (cutMarkColor.r ?? 0) / 255,
    (cutMarkColor.g ?? 0) / 255,
    (cutMarkColor.b ?? 0) / 255
  );

  // Per-image margins (mm)
  const imgMargin = {
    top: image.margin?.top ?? 0,
    right: image.margin?.right ?? 0,
    bottom: image.margin?.bottom ?? 0,
    left: image.margin?.left ?? 0,
  };

  // Inner (effective) image area in mm
  const innerMmW = Math.max(
    0,
    image.width - (imgMargin.left + imgMargin.right)
  );
  const innerMmH = Math.max(
    0,
    image.height - (imgMargin.top + imgMargin.bottom)
  );

  for (let sheetIdx = 0; sheetIdx < sheets.length; sheetIdx++) {
    const page = pdfDoc.addPage([mmToPt(paper.width), mmToPt(paper.height)]);
    const images = sheets[sheetIdx];

    // --- Centering calculations for the grid (in mm) ---
    const usableWidth = paper.width - paper.margin.left - paper.margin.right;
    const usableHeight = paper.height - paper.margin.top - paper.margin.bottom;
    const gridWidth =
      layout.cols * image.width + (layout.cols - 1) * paper.gap.horizontal;
    const gridHeight =
      layout.rows * image.height + (layout.rows - 1) * paper.gap.vertical;
    const gridOffsetX = paper.margin.left + (usableWidth - gridWidth) / 2;
    const gridOffsetY = paper.margin.top + (usableHeight - gridHeight) / 2;

    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        const idx = row * layout.cols + col;
        const img = images[idx];
        if (!img) continue;

        // Slot (outer cell) origin in points (bottom-left)
        const slotXPt = mmToPt(
          gridOffsetX + col * (image.width + paper.gap.horizontal)
        );
        const slotYPt = mmToPt(
          paper.height -
            (gridOffsetY + (row + 1) * image.height + row * paper.gap.vertical)
        );

        // Inner (inset) rect inside the slot (respect image margins)
        const insetXPt = slotXPt + mmToPt(imgMargin.left);
        const insetYPt = slotYPt + mmToPt(imgMargin.bottom);
        const insetWPt = mmToPt(innerMmW);
        const insetHPt = mmToPt(innerMmH);

        // Load and embed image
        const imageBytes = await fetch(img.src).then((r) => r.arrayBuffer());

        let pdfImage;
        if (img.src.startsWith("data:image/png")) {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else if (
          img.src.startsWith("data:image/jpeg") ||
          img.src.startsWith("data:image/jpg")
        ) {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          throw new Error("Unsupported image format: must be PNG or JPEG");
        }

        // Draw the image sized to the INNER rect (autoCoverCrop already matched the ratio)
        page.drawImage(pdfImage, {
          x: insetXPt,
          y: insetYPt,
          width: insetWPt,
          height: insetHPt,
        });

        // Draw cut marks at the OUTER slot bounds (unchanged)
        drawCutMarks(
          page,
          slotXPt,
          slotYPt,
          mmToPt(image.width),
          mmToPt(image.height),
          mmToPt(cutMarkLengthMm),
          rgbColor,
          cutMarkThicknessPt
        );
      }
    }

    // --- Optional: Add meta/footer ---
    if (customerName || description || date) {
      page.drawText(
        `${customerName ?? ""}   ${description ?? ""}   ${date ?? ""}`,
        {
          x: mmToPt(10),
          y: mmToPt(7),
          size: 15,
        }
      );
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
