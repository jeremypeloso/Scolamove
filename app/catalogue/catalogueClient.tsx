"use client";

import dynamic from "next/dynamic";

const CatalogueFlipbook = dynamic(
  () => import("@/components/CatalogueFlipbook"),
  {
    ssr: false,
    loading: () => (
      <div className="flipbook-loading">
        <div className="flipbook-loading-spinner" />
        <p>Chargement du catalogue…</p>
      </div>
    ),
  }
);

export default function CatalogueClient() {
  return <CatalogueFlipbook />;
}
