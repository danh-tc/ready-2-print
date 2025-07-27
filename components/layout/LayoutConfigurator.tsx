"use client";

import { calculateGridLayout } from "@/lib/layoutCalculator";
import { PaperPreview } from "./PaperPreview";
import { SummaryTable } from "./SummaryTable";
import "./layout-configurator.scss";
import { PaperSettingsForm } from "../config/PaperSettingsForm";
import { ImageSettingsForm } from "../config/ImageSettingsForm";
import { MetaInfoForm } from "../config/MetaInfoForm";
import { useImpositionStore } from "@/store/useImpositionStore";
import { useState } from "react";
import { useHydrated } from "@/hooks/useImpositionHydrated";
import Link from "next/link";

export default function LayoutConfigurator() {
  // Zustand hooks (global state)
  const paper = useImpositionStore((s) => s.paper);
  const setPaper = useImpositionStore((s) => s.setPaper);

  const image = useImpositionStore((s) => s.image);
  const setImage = useImpositionStore((s) => s.setImage);

  const meta = useImpositionStore((s) => s.meta);
  const setMeta = useImpositionStore((s) => s.setMeta);

  // const [showMeta, setShowMeta] = useState(true);
  const displayMeta = useImpositionStore((s) => s.displayMeta);
  const setDisplayMeta = useImpositionStore((s) => s.setDisplayMeta);

  const layout = calculateGridLayout(paper, image);
  const hydrated = useHydrated();
  if (!hydrated) return null; // Ensure the component only renders after hydration

  const handleResetForm = () => {
    useImpositionStore.persist.clearStorage();
    window.location.reload();
  };

  return (
    <div className="rethink-layout-configurator">
      <div className="rethink-layout-configurator__config">
        <PaperSettingsForm value={paper} onChange={setPaper} />
        <ImageSettingsForm value={image} onChange={setImage} />
        <MetaInfoForm
          value={meta}
          onChange={setMeta}
          displayMeta={displayMeta ?? true}
          onDisplayMetaChange={setDisplayMeta}
        />
      </div>
      <div className="rethink-layout-configurator__preview">
        <PaperPreview
          paper={paper}
          image={image}
          customerName={displayMeta ? meta.customerName : undefined}
          description={displayMeta ? meta.description : undefined}
          date={displayMeta ? meta.date : undefined}
        />
        <SummaryTable
          paper={paper}
          image={image}
          layout={layout}
          gap={paper.gap}
          margin={paper.margin}
        />
      </div>
      <div className="rethink-layout-configurator__actions">
        <button onClick={handleResetForm}>Reset</button>
        <button>
          <Link href="/impose">Confirm</Link>
        </button>
      </div>
    </div>
  );
}
