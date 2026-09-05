"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useImpositionStore } from "@/store/useImpositionStore";
import {
  LAYOUT_PRESETS,
  isSamePaper,
  isSameImage,
  type LayoutPreset,
  type PaperConfig,
} from "./Presets";
import type { ImageConfig } from "@/types/types";
import { useAdmin } from "@/hooks/useAdmin";
import { getPresets, createPreset, updatePreset, deletePreset } from "@/actions/presets";
import { PresetFormDialog } from "./PresetFormDialog";
import { event as gaEvent } from "@/lib/gtag";
import "./preset-label-bar.scss";

interface Props {
  readonly presets?: LayoutPreset[];
}

export const PresetLabelBar: React.FC<Props> = ({
  presets: initialPresets = LAYOUT_PRESETS,
}) => {
  const [presets, setPresets] = useState(initialPresets);

  // The site is statically exported (GitHub Pages) — `initialPresets` was
  // baked in at build time and can be stale, so refetch live data on mount.
  useEffect(() => {
    getPresets()
      .then(setPresets)
      .catch(() => {
        // Supabase not configured yet — keep the build-time/static fallback
      });
  }, []);
  const paper = useImpositionStore((s) => s.paper) as PaperConfig;
  const setPaper = useImpositionStore((s) => s.setPaper);
  const image = useImpositionStore((s) => s.image) as ImageConfig;
  const setImage = useImpositionStore((s) => s.setImage);

  const { isAdmin } = useAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LayoutPreset | null>(null);

  const activePresetId = useMemo(() => {
    return presets.find((p) => isSamePaper(p.paper, paper) && isSameImage(p.image, image))?.id ?? null;
  }, [presets, paper, image]);

  const handleSelect = (preset: LayoutPreset) => {
    setPaper(preset.paper);
    setImage(preset.image);
    gaEvent("preset_selected", {
      preset_id: preset.id,
      preset_label: preset.label,
    });
  };

  const openAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (e: React.MouseEvent, preset: LayoutPreset) => {
    e.stopPropagation();
    setEditTarget(preset);
    setFormOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this preset?")) return;
    await deletePreset(id);
    setPresets(await getPresets());
  };

  const handleCreate = async (preset: LayoutPreset) => {
    await createPreset(preset);
    setPresets(await getPresets());
  };

  const handleUpdate = async (preset: LayoutPreset) => {
    await updatePreset(preset);
    setPresets(await getPresets());
  };

  return (
    <>
      <div className="rethink-preset-bar">
        <div className="rethink-preset-bar__chips">
          {presets.map((preset) => {
            const isActive = activePresetId === preset.id;
            const groupCls = "rethink-preset-group" + (isActive ? " rethink-preset-group--active" : "");

            return (
              <div key={preset.id} className={groupCls}>
                <button
                  type="button"
                  className="rethink-preset-group__chip"
                  onClick={() => handleSelect(preset)}
                >
                  {preset.label}
                </button>

                {isAdmin && (
                  <span className="rethink-preset-group__actions">
                    <button
                      type="button"
                      aria-label={`Edit ${preset.label}`}
                      onClick={(e) => openEdit(e, preset)}
                      className="rethink-preset-group__action"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${preset.label}`}
                      onClick={(e) => handleDelete(e, preset.id)}
                      className="rethink-preset-group__action rethink-preset-group__action--delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                )}
              </div>
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

          {/* Add — admin only */}
          {isAdmin && (
            <button
              type="button"
              onClick={openAdd}
              className="rethink-preset-chip rethink-preset-chip--add"
              aria-label="Add preset"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      <PresetFormDialog
        open={formOpen}
        initial={editTarget}
        currentConfig={{ paper, image }}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </>
  );
};
