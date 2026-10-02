"use client";

import type { Onglet, Point } from "@/lib/voyage/controle";

const NOMS: Record<Onglet, string> = {
  dossier: "Dossier",
  programme: "Programme",
  cotation: "Cotation",
  devis: "Devis",
  reservations: "Réservations",
  feuille: "Feuille de route",
};

// Liste de ce qui manque ; chaque point renvoie à l'étape où le corriger.
export function Controle({ points, allerA, vide }: { points: Point[]; allerA: (o: Onglet) => void; vide: string }) {
  if (points.length === 0) return <p className="vg-ok">{vide}</p>;
  return (
    <ul className="vg-controle">
      {points.map((p, i) => (
        <li key={i} className={p.bloquant ? "vg-bloquant" : ""}>
          <span>{p.message}</span>
          <button type="button" className="vg-lien" onClick={() => allerA(p.onglet)}>
            {NOMS[p.onglet]}
          </button>
        </li>
      ))}
    </ul>
  );
}
