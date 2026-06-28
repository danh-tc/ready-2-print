"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import type { LayoutPreset, PaperConfig } from "./Presets";
import type { ImageConfig } from "@/types/types";
import "./preset-form-dialog.scss";

interface Props {
  readonly open: boolean;
  readonly initial: LayoutPreset | null;
  readonly currentConfig?: { paper: PaperConfig; image: ImageConfig };
  readonly onClose: () => void;
  readonly onCreate: (preset: LayoutPreset) => Promise<void>;
  readonly onUpdate: (preset: LayoutPreset) => Promise<void>;
}

const DEFAULT_PAPER: PaperConfig = {
  width: 297, height: 210,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  gap: { horizontal: 0, vertical: 0 },
};
const DEFAULT_IMAGE: ImageConfig = {
  width: 57, height: 93,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

const empty = (): LayoutPreset => ({
  id: "", label: "",
  paper: DEFAULT_PAPER,
  image: DEFAULT_IMAGE,
});

type NumField = {
  label: string;
  get: (p: LayoutPreset) => number;
  set: (p: LayoutPreset, v: number) => LayoutPreset;
};

const FIELDS: NumField[] = [
  { label: "Paper W (mm)",        get: (p) => p.paper.width,               set: (p, v) => ({ ...p, paper: { ...p.paper, width: v } }) },
  { label: "Paper H (mm)",        get: (p) => p.paper.height,              set: (p, v) => ({ ...p, paper: { ...p.paper, height: v } }) },
  { label: "Paper margin top",    get: (p) => p.paper.margin.top,          set: (p, v) => ({ ...p, paper: { ...p.paper, margin: { ...p.paper.margin, top: v } } }) },
  { label: "Paper margin right",  get: (p) => p.paper.margin.right,        set: (p, v) => ({ ...p, paper: { ...p.paper, margin: { ...p.paper.margin, right: v } } }) },
  { label: "Paper margin bottom", get: (p) => p.paper.margin.bottom,       set: (p, v) => ({ ...p, paper: { ...p.paper, margin: { ...p.paper.margin, bottom: v } } }) },
  { label: "Paper margin left",   get: (p) => p.paper.margin.left,         set: (p, v) => ({ ...p, paper: { ...p.paper, margin: { ...p.paper.margin, left: v } } }) },
  { label: "Gap horizontal",      get: (p) => p.paper.gap.horizontal,      set: (p, v) => ({ ...p, paper: { ...p.paper, gap: { ...p.paper.gap, horizontal: v } } }) },
  { label: "Gap vertical",        get: (p) => p.paper.gap.vertical,        set: (p, v) => ({ ...p, paper: { ...p.paper, gap: { ...p.paper.gap, vertical: v } } }) },
  { label: "Image W (mm)",        get: (p) => p.image.width,               set: (p, v) => ({ ...p, image: { ...p.image, width: v } }) },
  { label: "Image H (mm)",        get: (p) => p.image.height,              set: (p, v) => ({ ...p, image: { ...p.image, height: v } }) },
  { label: "Image margin top",    get: (p) => p.image.margin?.top    ?? 0, set: (p, v) => ({ ...p, image: { ...p.image, margin: { ...p.image.margin, top: v } } }) },
  { label: "Image margin right",  get: (p) => p.image.margin?.right  ?? 0, set: (p, v) => ({ ...p, image: { ...p.image, margin: { ...p.image.margin, right: v } } }) },
  { label: "Image margin bottom", get: (p) => p.image.margin?.bottom ?? 0, set: (p, v) => ({ ...p, image: { ...p.image, margin: { ...p.image.margin, bottom: v } } }) },
  { label: "Image margin left",   get: (p) => p.image.margin?.left   ?? 0, set: (p, v) => ({ ...p, image: { ...p.image, margin: { ...p.image.margin, left: v } } }) },
];

export function PresetFormDialog({ open, initial, currentConfig, onClose, onCreate, onUpdate }: Props) {
  const [draft, setDraft] = useState<LayoutPreset>(empty());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const labelRef = useRef<HTMLInputElement>(null);
  const isNew = initial === null;

  useEffect(() => {
    if (open) {
      if (initial) {
        setDraft(initial);
      } else {
        setDraft({
          ...empty(),
          id: crypto.randomUUID(),
          paper: currentConfig?.paper ?? DEFAULT_PAPER,
          image: currentConfig?.image ?? DEFAULT_IMAGE,
        });
      }
      setError(null);
      setTimeout(() => labelRef.current?.focus(), 0);
    }
  }, [open, initial, currentConfig]);

  if (!open) return null;

  const handleLabelChange = (label: string) => {
    setDraft((prev) => ({ ...prev, label }));
  };

  const handleReset = () => {
    setDraft((prev) => ({ ...empty(), id: prev.id, label: prev.label }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!draft.label.trim()) { setError("Label is required"); return; }

    startTransition(async () => {
      try {
        if (isNew) {
          await onCreate(draft);
        } else {
          await onUpdate(draft);
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  };

  return (
    <div className="preset-form-overlay">
      <button
        type="button"
        className="preset-form-overlay__backdrop"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />
      <dialog
        open
        className="preset-form-dialog"
        aria-label={isNew ? "Add preset" : "Edit preset"}
      >
        <h2 className="preset-form-dialog__title">
          {isNew ? "Add Preset" : `Edit "${initial?.label}"`}
        </h2>

        <form onSubmit={handleSubmit} className="preset-form-dialog__form">
          <div className="preset-form-dialog__field">
            <label htmlFor="preset-label">Label</label>
            <input
              id="preset-label"
              ref={labelRef}
              value={draft.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. 3×4"
              required
              disabled={isPending}
            />
          </div>

          <div className="preset-form-dialog__grid">
            {FIELDS.map((f) => (
              <div key={f.label} className="preset-form-dialog__field">
                <label htmlFor={`preset-field-${f.label}`}>{f.label}</label>
                <input
                  id={`preset-field-${f.label}`}
                  type="number"
                  step="0.1"
                  value={f.get(draft)}
                  disabled={isPending}
                  onChange={(e) =>
                    setDraft(f.set(draft, Number.parseFloat(e.target.value) || 0))
                  }
                />
              </div>
            ))}
          </div>

          {error && <p className="preset-form-dialog__error">{error}</p>}

          <div className="preset-form-dialog__actions">
            <button
              type="button"
              className="preset-form-dialog__reset-btn"
              onClick={handleReset}
              disabled={isPending}
              title="Reset to system defaults"
            >
              <RotateCcw size={14} />
              Reset defaults
            </button>

            <div className="preset-form-dialog__actions-right">
              <button
                type="button"
                className="rethink-btn rethink-btn--outline rethink-btn--md"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rethink-btn rethink-btn--primary rethink-btn--md"
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}
