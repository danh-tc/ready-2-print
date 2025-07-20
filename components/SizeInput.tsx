'use client';

import { useState } from "react";

export type Unit = "mm" | "cm" | "in";

interface SizeInputProps {
  label?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultUnit?: Unit;
  onChange?: (size: { width: number; height: number; unit: Unit }) => void;
}
export default function SizeInput({
  label = "Size",
  defaultWidth = 210,
  defaultHeight = 297,
  defaultUnit = "mm",
  onChange,
}: SizeInputProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [unit, setUnit] = useState<Unit>(defaultUnit);
  const handleChange = () => {
    onChange?.({ width, height, unit });
  };

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <label>{label}</label>
      <input
        type="number"
        value={width}
        onChange={(e) => {
          setWidth(Number(e.target.value));
          handleChange();
        }}
        style={{ width: 80 }}
      />
      <span>×</span>
      <input
        type="number"
        value={height}
        onChange={(e) => {
          setHeight(Number(e.target.value));
          handleChange();
        }}
        style={{ width: 80 }}
      />

      <select
        value={unit}
        onChange={(e) => {
          setUnit(e.target.value as Unit);
          handleChange();
        }}
      >
        <option value="mm">mm</option>
        <option value="cm">cm</option>
        <option value="in">in</option>
      </select>
    </div>
  );
}
