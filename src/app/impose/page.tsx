"use client";

import { useState } from "react";
import ItemsHandler from "@/components/items-handler/ItemsHandler";

export default function ImpositionPage() {
  const [images, setImages] = useState([]);
  return (
    <>
      <ItemsHandler />
    </>
  );
}
