"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import "./voyages.css";

const sAbonner = () => () => {};

// Même garde que le reste de l'administration : la session s'ouvre depuis /admin.
export default function VoyagesLayout({ children }: { children: ReactNode }) {
  const acces = useSyncExternalStore(
    sAbonner,
    () => (localStorage.getItem("scolamove-admin") === "true" ? "ouvert" : "ferme"),
    () => "attente"
  );

  if (acces === "attente") return <div className="vg vg-centre" />;
  if (acces === "ferme") {
    return (
      <div className="vg vg-centre">
        <div className="vg-bloc">
          <h1>Devis et dossiers de voyage</h1>
          <p className="vg-note">Connecte-toi depuis le tableau de bord pour ouvrir cet espace.</p>
          <Link className="vg-btn vg-btn-plein" href="/admin">
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    );
  }
  return <div className="vg">{children}</div>;
}
