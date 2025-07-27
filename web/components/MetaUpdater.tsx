"use client";

import { useEffect } from "react";

export default function MetaUpdater() {
  useEffect(() => {
    const updateMeta = () => {
      const html = document.documentElement;
      const isDark = html.classList.contains("dark");

      let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = isDark ? "#1e1b18" : "#ffffff";
    };

    // run once on mount
    updateMeta();

    // watch for <html class> changes
    const mo = new MutationObserver(updateMeta);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // also update if the user’s OS preference flips while on “system”
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", updateMeta);

    return () => {
      mo.disconnect();
      mql.removeEventListener("change", updateMeta);
    };
  }, []);

  return null;
}
