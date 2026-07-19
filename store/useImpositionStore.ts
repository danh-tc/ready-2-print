import { getTodayString } from "@/lib/utils";
import { ImageConfig, PaperConfig } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MetaInfo = {
  customerName: string;
  date: string;
  description: string;
};

export type MetaStyle = {
  customPosition: boolean;
  x: number;        // mm from left  (default 10)
  y: number;        // mm from bottom (default 4)
  fontSize: number; // pt             (default 12)
};

export const DEFAULT_META_STYLE: MetaStyle = {
  customPosition: false,
  x: 10,
  y: 4,
  fontSize: 12,
};

interface ImpositionState {
  paper: PaperConfig;
  setPaper: (paper: PaperConfig) => void;
  image: ImageConfig;
  setImage: (image: ImageConfig) => void;
  meta: MetaInfo;
  setMeta: (meta: MetaInfo) => void;
  displayMeta: boolean;
  setDisplayMeta: (displayMeta: boolean) => void;
  metaStyle: MetaStyle;
  setMetaStyle: (metaStyle: MetaStyle) => void;
}

const defaultImage: ImageConfig = {
  width: 57,
  height: 92,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

const defaultPaper: PaperConfig = {
  width: 297,
  height: 210,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  gap: { horizontal: 0, vertical: 0 },
};

export const useImpositionStore = create<ImpositionState>()(
  persist(
    (set) => ({
      paper: defaultPaper,
      setPaper: (paper) => set({ paper }),
      image: defaultImage,
      setImage: (image) => set({ image }),
      meta: { customerName: "", date: getTodayString(), description: "" },
      setMeta: (meta) => set({ meta }),
      displayMeta: true,
      setDisplayMeta: (displayMeta) => set({ displayMeta }),
      metaStyle: DEFAULT_META_STYLE,
      setMetaStyle: (metaStyle) => set({ metaStyle }),
    }),
    {
      name: "imposition-storage",
    }
  )
);
