import LayoutConfigurator from "@/components/layout/LayoutConfigurator";
import { LAYOUT_PRESETS } from "@/components/config/Presets";

// Static export (GitHub Pages) — this runs once at build time only, so it
// can't reflect presets saved after deploy. Real data is fetched client-side
// in PresetLabelBar on mount; this is just the placeholder for first paint.
export default function Page() {
  return <LayoutConfigurator presets={LAYOUT_PRESETS} />;
}
