"use client";

import { useEffect } from "react";

export function telecharger(blob: Blob, nom: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Aperçu d'un PDF en plein écran, fermé par Échap ou par le bouton.
export function Apercu({ url, titre, fermer }: { url: string; titre: string; fermer: () => void }) {
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
    };
    window.addEventListener("keydown", touche);
    return () => {
      window.removeEventListener("keydown", touche);
      URL.revokeObjectURL(url);
    };
  }, [url, fermer]);

  return (
    <div className="vg-apercu" role="dialog" aria-label={`Aperçu : ${titre}`}>
      <div className="vg-apercu-barre">
        <strong>{titre}</strong>
        <button type="button" className="vg-btn" onClick={fermer}>
          Fermer
        </button>
      </div>
      <iframe src={url} title={titre} />
    </div>
  );
}
