"use client";

import { calculateGridLayout } from "@/lib/layoutCalculator";
import { PaperPreview } from "./PaperPreview";
import { SummaryTable } from "./SummaryTable";
import "./layout-configurator.scss";
import { PaperSettingsForm } from "../config/PaperSettingsForm";
import { useState } from "react";
import { ImageSettingsForm } from "../config/ImageSettingsForm";
import { MetaInfoForm } from "../config/MetaInfoForm";

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function LayoutConfigurator() {
  const [paper, setPaper] = useState({
    width: 297,
    height: 210,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    gap: { horizontal: 5, vertical: 5 },
  });
  const [image, setImage] = useState({ width: 90, height: 60 });
  const [meta, setMeta] = useState({
    customerName: "",
    date: getTodayString(),
    description: "",
  });
  const [showMeta, setShowMeta] = useState(true);

  const layout = calculateGridLayout(paper, image);

  return (
    <div className="rethink-layout-configurator">
      <div className="rethink-layout-configurator__config">
        <PaperSettingsForm value={paper} onChange={setPaper} />
        <ImageSettingsForm value={image} onChange={setImage} />
        <MetaInfoForm
          value={meta}
          onChange={setMeta}
          showMeta={showMeta}
          onShowMetaChange={setShowMeta}
        />
      </div>
      <div className="rethink-layout-configurator__preview">
        <PaperPreview
          paper={paper}
          image={image}
          customerName={showMeta ? meta.customerName : undefined}
          description={showMeta ? meta.description : undefined}
          date={showMeta ? meta.date : undefined}
        />
        <SummaryTable
          paper={paper}
          image={image}
          layout={layout}
          gap={paper.gap}
          margin={paper.margin}
        />
      </div>
    </div>
  );
}
