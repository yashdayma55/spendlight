"use client";

import { useEffect, useRef } from "react";
import { usePenny } from "./PennyContext";
import { FISCAL_METADATA } from "@/lib/data";

export default function PennyIntro() {
  const penny = usePenny();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const totalB = (FISCAL_METADATA.total_spend / 1e9).toFixed(1);
    penny.explain(
      `Penny is meeting the user for the first time on page load. Introduce yourself as Penny, their spending guide. Mention Washington State spent $${totalB}B in FY2022 with ${FISCAL_METADATA.total_transactions.toLocaleString()} payments. Invite them to click charts or ask questions. Exactly 2 warm plain-English sentences.`
    );
  }, [penny]);

  return null;
}
