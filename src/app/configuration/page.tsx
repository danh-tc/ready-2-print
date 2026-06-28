import LayoutConfigurator from "@/components/layout/LayoutConfigurator";
import { getPresets } from "@/actions/presets";
import { LAYOUT_PRESETS } from "@/components/config/Presets";

export default async function Page() {
  let presets = LAYOUT_PRESETS;
  try {
    presets = await getPresets();
  } catch {
    // Supabase not configured yet — fall back to static presets
  }

  return <LayoutConfigurator presets={presets} />;
}
