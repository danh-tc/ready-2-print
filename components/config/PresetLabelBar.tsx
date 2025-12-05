"use client";

import { useMemo } from "react";
import { useImpositionStore } from "@/store/useImpositionStore";
import { LAYOUT_PRESETS, findMatchingPreset } from "./Presets";
import type { PaperConfig } from "./Presets";
import type { ImageConfig } from "@/types/types";
import "./preset-label-bar.scss";

export const PresetLabelBar: React.FC = () => {
  const paper = useImpositionStore((s) => s.paper) as PaperConfig;
  const setPaper = useImpositionStore((s) => s.setPaper);
  const image = useImpositionStore((s) => s.image) as ImageConfig;
  const setImage = useImpositionStore((s) => s.setImage);

  const activePresetId = useMemo(() => {
    const p = findMatchingPreset(paper, image);
    return p?.id ?? null;
  }, [paper, image]);

  const handleSelect = (id: string) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPaper(preset.paper);
    setImage(preset.image);
  };

  return (
    <div className="rethink-preset-bar">
      <div className="rethink-preset-bar__chips">
        {LAYOUT_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelect(preset.id)}
              className={
                "rethink-preset-chip" +
                (isActive ? " rethink-preset-chip--active" : "")
              }
            >
              {preset.label}
            </button>
          );
        })}

        {/* Custom chip */}
        <button
          type="button"
          className={
            "rethink-preset-chip rethink-preset-chip--custom" +
            (activePresetId === null ? " rethink-preset-chip--active" : "")
          }
        >
          Custom
        </button>
      </div>
    </div>
  );
};
