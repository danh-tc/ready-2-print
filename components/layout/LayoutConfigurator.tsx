"use client";

import { calculateGridLayout } from "@/lib/layoutCalculator";
import { PaperPreview } from "./PaperPreview";
import { SummaryTable } from "./SummaryTable";
import "./layout-configurator.scss";
import { PaperSettingsForm } from "../config/PaperSettingsForm";
import { useState } from "react";
import { ImageSettingsForm } from "../config/ImageSettingsForm";
import { MetaInfoForm } from "../config/MetaInfoForm";

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
    date: "",
    description: "",
  });
  const layout = calculateGridLayout(paper, image);
  return (
    <div className="rethink-layout-configurator">
      <div className="rethink-layout-configurator__config">
        <PaperSettingsForm value={paper} onChange={setPaper} />
        <ImageSettingsForm value={image} onChange={setImage} />
        <MetaInfoForm value={meta} onChange={setMeta} />
      </div>
      <div className="rethink-layout-configurator__preview">
        <PaperPreview
          paper={paper}
          image={image}
          customerName={meta.customerName}
          description={meta.description}
          date={meta.date}
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
