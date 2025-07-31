import { getTodayString } from "@/lib/utils";
import { ImageConfig, PaperConfig } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";




export type MetaInfo = {
  customerName: string;
  date: string;
  description: string;
};

interface ImpositionState {
  paper: PaperConfig;
  setPaper: (paper: PaperConfig) => void;
  image: ImageConfig;
  setImage: (image: ImageConfig) => void;
  meta: MetaInfo;
  setMeta: (meta: MetaInfo) => void;
  displayMeta?: boolean; // Optional field for controlling meta display
  setDisplayMeta: (displayMeta: boolean) => void;
}

// export const useImpositionStore = create<ImpositionState>((set) => ({
//   paper: {
//     width: 297,
//     height: 210,
//     margin: { top: 10, right: 10, bottom: 10, left: 10 },
//     gap: { horizontal: 3, vertical: 3 },
//   },
//   setPaper: (paper) => set({ paper }),
//   image: { width: 30, height: 40 },
//   setImage: (image) => set({ image }),
//   meta: { customerName: "", date: getTodayString(), description: "" },
//   setMeta: (meta) => set({ meta }),
// }));

export const useImpositionStore = create<ImpositionState>()(
  persist(
    (set) => ({
      paper: {
        width: 297,
        height: 210,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        gap: { horizontal: 3, vertical: 3 },
      },
      setPaper: (paper) => set({ paper }),
      image: { width: 30, height: 40 },
      setImage: (image) => set({ image }),
      meta: { customerName: "", date: getTodayString(), description: "" },
      setMeta: (meta) => set({ meta }),
      setDisplayMeta: (displayMeta) => set({ displayMeta: displayMeta }),
      displayMeta: true, // Default value for displayMeta
    }),
    {
      name: "imposition-storage", // localStorage key
      // Optionally, you can control which fields to persist
    }
  )
);
