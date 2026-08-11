"use client";

import { useEffect, useState } from "react";

/**
 * next/font hashes the real family name behind a CSS variable, but Konva draws
 * to a canvas and needs a literal family string. Resolve the variables once the
 * fonts have actually loaded, then bump state so the stage redraws with correct
 * metrics.
 */
export function useFontFamilies() {
  const [families, setFamilies] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      setFamilies({
        Fredoka: styles.getPropertyValue("--font-fredoka").trim() || "sans-serif",
        Inter: styles.getPropertyValue("--font-inter").trim() || "sans-serif",
        Caveat: styles.getPropertyValue("--font-caveat").trim() || "cursive",
        Arima: styles.getPropertyValue("--font-arima").trim() || "sans-serif",
      });
    };

    read();
    document.fonts?.ready.then(read).catch(() => {});
  }, []);

  return (requested: string) => families[requested] ?? requested;
}
