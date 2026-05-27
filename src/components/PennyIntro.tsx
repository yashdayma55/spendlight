"use client";

import { useEffect, useRef } from "react";
import { usePenny } from "./PennyContext";

export default function PennyIntro() {
  const penny = usePenny();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    penny.showIntroduction();
  }, [penny]);

  return null;
}
