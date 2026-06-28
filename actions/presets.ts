"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LayoutPreset } from "@/components/config/Presets";

// ---------- DB row ↔ LayoutPreset mapping ----------

type PresetRow = {
  id: string;
  label: string;
  sort_order: number;
  paper_width: number;
  paper_height: number;
  paper_margin_top: number;
  paper_margin_right: number;
  paper_margin_bottom: number;
  paper_margin_left: number;
  paper_gap_horizontal: number;
  paper_gap_vertical: number;
  image_width: number;
  image_height: number;
  image_margin_top: number;
  image_margin_right: number;
  image_margin_bottom: number;
  image_margin_left: number;
};

function rowToPreset(row: PresetRow): LayoutPreset {
  return {
    id: row.id,
    label: row.label,
    paper: {
      width: row.paper_width,
      height: row.paper_height,
      margin: {
        top: row.paper_margin_top,
        right: row.paper_margin_right,
        bottom: row.paper_margin_bottom,
        left: row.paper_margin_left,
      },
      gap: {
        horizontal: row.paper_gap_horizontal,
        vertical: row.paper_gap_vertical,
      },
    },
    image: {
      width: row.image_width,
      height: row.image_height,
      margin: {
        top: row.image_margin_top,
        right: row.image_margin_right,
        bottom: row.image_margin_bottom,
        left: row.image_margin_left,
      },
    },
  };
}

function presetToRow(
  preset: LayoutPreset,
  sortOrder: number
): PresetRow {
  return {
    id: preset.id,
    label: preset.label,
    sort_order: sortOrder,
    paper_width: preset.paper.width,
    paper_height: preset.paper.height,
    paper_margin_top: preset.paper.margin.top,
    paper_margin_right: preset.paper.margin.right,
    paper_margin_bottom: preset.paper.margin.bottom,
    paper_margin_left: preset.paper.margin.left,
    paper_gap_horizontal: preset.paper.gap.horizontal,
    paper_gap_vertical: preset.paper.gap.vertical,
    image_width: preset.image.width,
    image_height: preset.image.height,
    image_margin_top: preset.image.margin?.top ?? 0,
    image_margin_right: preset.image.margin?.right ?? 0,
    image_margin_bottom: preset.image.margin?.bottom ?? 0,
    image_margin_left: preset.image.margin?.left ?? 0,
  };
}

// ---------- READ (public) ----------

export async function getPresets(): Promise<LayoutPreset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as PresetRow[]).map(rowToPreset);
}

// ---------- WRITE (admin only — RLS enforces auth) ----------

export async function createPreset(preset: LayoutPreset): Promise<void> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("presets")
    .select("*", { count: "exact", head: true });

  const row = presetToRow(preset, count ?? 0);
  const { error } = await supabase.from("presets").insert(row);
  if (error) throw new Error(error.message);

  revalidatePath("/configuration");
}

export async function updatePreset(preset: LayoutPreset): Promise<void> {
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("presets")
    .select("sort_order")
    .eq("id", preset.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const row = presetToRow(preset, existing.sort_order);
  const { error } = await supabase
    .from("presets")
    .update(row)
    .eq("id", preset.id);

  if (error) throw new Error(error.message);
  revalidatePath("/configuration");
}

export async function deletePreset(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("presets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/configuration");
}
