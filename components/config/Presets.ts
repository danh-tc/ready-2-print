import type { ImageConfig } from "@/types/types";

export interface PaperConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  gap: { horizontal: number; vertical: number };
}

export interface LayoutPreset {
  id: string;
  label: string;
  paper: PaperConfig;
  image: ImageConfig;
}

export const isSamePaper = (a: PaperConfig, b: PaperConfig): boolean => {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.margin.top === b.margin.top &&
    a.margin.right === b.margin.right &&
    a.margin.bottom === b.margin.bottom &&
    a.margin.left === b.margin.left &&
    a.gap.horizontal === b.gap.horizontal &&
    a.gap.vertical === b.gap.vertical
  );
};

export const isSameImage = (a: ImageConfig, b: ImageConfig): boolean => {
  const ma = a.margin ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const mb = b.margin ?? { top: 0, right: 0, bottom: 0, left: 0 };

  return (
    a.width === b.width &&
    a.height === b.height &&
    ma.top === mb.top &&
    ma.right === mb.right &&
    ma.bottom === mb.bottom &&
    ma.left === mb.left
  );
};

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "P-TD",
    label: "P (TD)",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 6 },
    },
    image: {
      width: 57,
      height: 94,
      margin: { top: 7, right: 5, bottom: 21, left: 5 },
    },
  },
  {
    id: "T-TD",
    label: "T (TD)",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 6 },
    },
    image: {
      width: 57,
      height: 94,
      margin: { top: 9, right: 5, bottom: 9, left: 5 },
    },
  },
  {
    id: "T",
    label: "T",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 0 },
    },
    image: {
      width: 57,
      height: 93,
      margin: { top: 9, right: 5, bottom: 9, left: 5 },
    },
  },
  {
    id: "P",
    label: "P",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 0 },
    },
    image: {
      width: 57,
      height: 93,
      margin: { top: 6, right: 5, bottom: 20, left: 5 },
    },
  },
  {
    id: "3x4",
    label: "3×4",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 3, vertical: 3 },
    },
    image: {
      width: 32,
      height: 42,
      margin: { top: 3, right: 3, bottom: 3, left: 3 },
    },
  },
  {
    id: "4x6",
    label: "4×6",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 6, left: 0 },
      gap: { horizontal: 3, vertical: 3 },
    },
    image: {
      width: 42,
      height: 62,
      margin: { top: 3, right: 3, bottom: 3, left: 3 },
    },
  },
  {
    id: "5x7",
    label: "5×7",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 0 },
    },
    image: {
      width: 57,
      height: 73,
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
    },
  },
  {
    id: "6x9",
    label: "6×9",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 5, vertical: 0 },
    },
    image: {
      width: 62,
      height: 93,
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
    },
  },
  {
    id: "9x12",
    label: "9×12",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 35, vertical: 0 },
    },
    image: {
      width: 123,
      height: 93,
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
    },
  },
  {
    id: "10x15",
    label: "10×15",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 0 },
    },
    image: {
      width: 148,
      height: 105,
      margin: { top: 4, right: 4, bottom: 4, left: 4 },
    },
  },
  {
    id: "13x18",
    label: "13×18",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 20, left: 0 },
      gap: { horizontal: 20, vertical: 0 },
    },
    image: {
      width: 132,
      height: 182,
      margin: { top: 4, right: 4, bottom: 4, left: 4 },
    },
  },
  {
    id: "15x21",
    label: "15×21",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 0 },
    },
    image: {
      width: 148,
      height: 210,
      margin: { top: 4, right: 4, bottom: 4, left: 4 },
    },
  },
  {
    id: "21x30",
    label: "21×30",
    paper: {
      width: 297,
      height: 210,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: { horizontal: 0, vertical: 0 },
    },
    image: {
      width: 297,
      height: 210,
      margin: { top: 4, right: 4, bottom: 4, left: 4 },
    },
  },
];

export const findMatchingPreset = (
  paper: PaperConfig,
  image: ImageConfig
): LayoutPreset | undefined => {
  return LAYOUT_PRESETS.find(
    (preset) =>
      isSamePaper(preset.paper, paper) && isSameImage(preset.image, image)
  );
};
