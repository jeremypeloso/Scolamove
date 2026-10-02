"use client";

import { useState, type ReactNode } from "react";

export function Champ({
  label,
  aide,
  large,
  children,
}: {
  label: string;
  aide?: string;
  large?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={large ? "vg-champ vg-champ-large" : "vg-champ"}>
      <span className="vg-label">{label}</span>
      {children}
      {aide ? <span className="vg-aide">{aide}</span> : null}
    </label>
  );
}

export function Texte({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  titre,
  liste,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  titre?: string;
  liste?: string;
}) {
  return (
    <input
      className={`vg-input ${className}`}
      type={type}
      value={value}
      placeholder={placeholder}
      aria-label={titre || placeholder}
      title={titre}
      list={liste}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Zone({
  value,
  onChange,
  lignes = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  lignes?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className="vg-input vg-zone"
      rows={lignes}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function lire(texte: string): number | null {
  const propre = texte.replace(/\s/g, "").replace(",", ".");
  if (propre === "" || propre === "-") return 0;
  const x = Number(propre);
  return Number.isFinite(x) ? x : null;
}

function ecrire(valeur: number): string {
  if (!valeur) return "";
  return String(Math.round(valeur * 100) / 100).replace(".", ",");
}

// Champ numérique : accepte la virgule, se vide à zéro, sélectionne son contenu
// à la prise de focus pour qu'une frappe remplace la valeur.
export function Nombre({
  value,
  onChange,
  titre,
  suffixe,
  placeholder = "0",
  className = "",
  desactive,
}: {
  value: number;
  onChange: (v: number) => void;
  titre?: string;
  suffixe?: string;
  placeholder?: string;
  className?: string;
  desactive?: boolean;
}) {
  const [saisie, setSaisie] = useState<string | null>(null);
  return (
    <span className={`vg-nombre ${className}`}>
      <input
        className="vg-input"
        inputMode="decimal"
        disabled={desactive}
        aria-label={titre}
        title={titre}
        placeholder={placeholder}
        value={saisie ?? ecrire(value)}
        onFocus={(e) => {
          const el = e.currentTarget;
          setSaisie(ecrire(value));
          setTimeout(() => el.select(), 0);
        }}
        onChange={(e) => {
          setSaisie(e.target.value);
          const x = lire(e.target.value);
          if (x !== null) onChange(x);
        }}
        onBlur={() => setSaisie(null)}
      />
      {suffixe ? <span className="vg-suffixe">{suffixe}</span> : null}
    </span>
  );
}

export function Bloc({
  titre,
  actions,
  children,
  note,
}: {
  titre: string;
  actions?: ReactNode;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section className="vg-bloc">
      <div className="vg-bloc-tete">
        <div>
          <h2>{titre}</h2>
          {note ? <p className="vg-note">{note}</p> : null}
        </div>
        {actions ? <div className="vg-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
