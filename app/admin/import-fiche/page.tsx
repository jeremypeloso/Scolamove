"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import { textToProgram, type SupabaseProgramDay } from "@/lib/sejours-supabase";

const ADMIN_PASSWORD_FLAG = "scolamove-admin";

declare global {
  interface Window {
    Tesseract?: {
      recognize: (
        file: File,
        lang: string,
        opts: { logger: (m: { status: string; progress: number }) => void }
      ) => Promise<{
        data: {
          text: string;
          words?: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[];
        };
      }>;
    };
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type FicheForm = {
  slug: string;
  title: string;
  destination: string;
  country: string;
  region: string;
  language: string;
  duration: string;
  level: string;
  accommodation: string;
  transport: string;
  price: string;
  theme: string;
  description: string;
  objectivesText: string;
  programText: string;
  visitBudget: string;
  possibleVisits: string;
  hidden: boolean;
};

const emptyForm: FicheForm = {
  slug: "",
  title: "",
  destination: "",
  country: "",
  region: "",
  language: "",
  duration: "",
  level: "",
  accommodation: "",
  transport: "",
  price: "",
  theme: "",
  description: "",
  objectivesText: "",
  programText: "",
  visitBudget: "",
  possibleVisits: "",
  hidden: true,
};

export default function ImportFichePage() {
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    setIsLogged(localStorage.getItem(ADMIN_PASSWORD_FLAG) === "true");
  }, []);

  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrRawText, setOcrRawText] = useState("");
  const [form, setForm] = useState<FicheForm>(emptyForm);
  const [saveStatus, setSaveStatus] = useState("");

  // Valeurs déjà utilisées sur le site, pour que la fiche importée s'intègre aux filtres existants
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  useEffect(() => {
    if (!isLogged) return;
    (async () => {
      const { data, error } = await supabase.from("sejours").select("country, region, theme, level");
      if (!error && data) {
        setCountries(Array.from(new Set(data.map((d) => d.country))).sort());
        setRegions(Array.from(new Set(data.map((d) => d.region))).sort());
        setThemes(
          Array.from(new Set(data.map((d) => d.theme).filter(Boolean) as string[])).sort()
        );
        setLevels(Array.from(new Set(data.map((d) => d.level))).sort());
      }
    })();
  }, [isLogged]);

  function update<K extends keyof FicheForm>(key: K, value: FicheForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFicheUpload(file: File) {
    if (typeof window === "undefined" || !window.Tesseract) {
      setOcrStatus("La lecture d'image n'a pas pu se charger (connexion internet requise).");
      return;
    }
    setOcrStatus("Lecture de l'image en cours... (peut prendre 15-30 secondes)");
    try {
      const { data } = await window.Tesseract.recognize(file, "fra", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrStatus(`Lecture en cours... ${Math.round((m.progress || 0) * 100)}%`);
          }
        },
      });
      const text = data.text;

      // Reconstruction colonne par colonne (fiches en 2 colonnes) — même logique que Devis Express :
      // sans ça, Tesseract.js mélange souvent les deux colonnes ligne par ligne.
      let columnAwareText = text;
      const words = data.words || [];
      if (words.length > 20) {
        const minX = Math.min(...words.map((w) => w.bbox.x0));
        const maxX = Math.max(...words.map((w) => w.bbox.x1));
        const midX = (minX + maxX) / 2;

        const buildColumnText = (colWords: typeof words) => {
          const sorted = [...colWords].sort((a, b) => a.bbox.y0 - b.bbox.y0);
          const lines: { y: number; words: typeof words }[] = [];
          const tol = 12;
          sorted.forEach((w) => {
            const line = lines.find((l) => Math.abs(l.y - w.bbox.y0) < tol);
            if (line) {
              line.words.push(w);
              line.y = (line.y + w.bbox.y0) / 2;
            } else {
              lines.push({ y: w.bbox.y0, words: [w] });
            }
          });
          lines.sort((a, b) => a.y - b.y);
          let out = "";
          let prevY: number | null = null;
          lines.forEach((l) => {
            const lineText = l.words.sort((a, b) => a.bbox.x0 - b.bbox.x0).map((w) => w.text).join(" ");
            if (prevY !== null && l.y - prevY > tol * 2.5) out += "\n";
            out += lineText + "\n";
            prevY = l.y;
          });
          return out;
        };

        const leftWords = words.filter((w) => w.bbox.x0 < midX);
        const rightWords = words.filter((w) => w.bbox.x0 >= midX);
        columnAwareText = buildColumnText(leftWords) + "\n\n" + buildColumnText(rightWords);
      }
      setOcrRawText(columnAwareText);

      // --- Extraction des champs structurés ---
      const mPays = columnAwareText.match(/Pays\s*:?\s*([A-Za-zÀ-ÿ' -]+)/i);
      const mNiveau = columnAwareText.match(/Niveau scolaire\s*:?\s*([^\n]+)/i);
      const mFormule = columnAwareText.match(/Formule\s*:?\s*([^\n]+)/i);
      const mTransport = columnAwareText.match(/Transport\s*:?\s*([^\n]+)/i);
      const mHebergement = columnAwareText.match(/H[ée]bergement\s*:?\s*([^\n]+)/i);
      const mJours = columnAwareText.match(/(\d+)\s*JOURS?/i);
      const mNuits = columnAwareText.match(/(\d+)\s*NUITS?/i);
      const mPrix = columnAwareText.match(/à\s*partir\s*de\s*(\d+[.,]?\d*)\s*€/i);
      const mBudget =
        columnAwareText.match(/budget\s*visites?[\s\S]{0,100}?(\d+[.,]?\d*)\s*€/i) ||
        columnAwareText.match(/environ\s*(\d+[.,]?\d*)\s*€/i);

      // Titre / destination : première ligne en majuscules significative (ex. "ESPAGNE L'ANDALOUSIE")
      const lines = columnAwareText.split("\n").map((l) => l.trim()).filter(Boolean);
      const titleLine = lines.find(
        (l) => l.length > 5 && l === l.toUpperCase() && /[A-ZÀ-Ÿ]/.test(l) && !/^\d/.test(l)
      );

      // Sous-titre destination (ex. "Cordoue, Séville, Grenade") : ligne courte juste après le titre, avec virgules
      let destinationLine = "";
      if (titleLine) {
        const idx = lines.indexOf(titleLine);
        const candidate = lines.slice(idx + 1, idx + 6).find((l) => l.includes(",") && l.length < 60);
        if (candidate) destinationLine = candidate;
      }

      // Objectifs pédagogiques : lignes qui suivent ce titre, jusqu'à un bloc clairement différent
      const objIdx = lines.findIndex((l) => /objectifs\s*p[ée]dagogiques/i.test(l));
      let objectives: string[] = [];
      if (objIdx >= 0) {
        objectives = lines
          .slice(objIdx + 1, objIdx + 8)
          .filter((l) => l.length > 15 && !/^(pays|niveau|formule|transport|h[ée]bergement)\s*:/i.test(l))
          .slice(0, 5);
      }

      // Programme : même logique que Devis Express (JOUR X explicite, sinon repli par mots-clés)
      const jourRegex = /JOUR\s*\d+[^\n]*(?:\n(?!JOUR\s*\d+|BUDGET|AUTRES)[^\n]*)*/gi;
      let joursTrouves: string[] = columnAwareText.match(jourRegex) || [];
      let usedFallback = false;
      if (joursTrouves.length < 2) {
        usedFallback = true;
        const startKeywords =
          /^(départ|arrivée|visite|excursion|retour|petit-déjeuner|découverte|journée|matinée|après-midi|route)/i;
        const excludeNoise = /budget|^www\.|base\s*\d+\s*\+\s*\d+|environ.*€/i;
        const blocks = columnAwareText.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
        joursTrouves = blocks.filter(
          (b) => b.length >= 25 && !excludeNoise.test(b) && startKeywords.test(b)
        );
      }
      const programDays: SupabaseProgramDay[] = joursTrouves.map((j, i) => {
        if (usedFallback) {
          return { day: `Jour ${i + 1}`, title: "", text: j.trim() };
        }
        const jourLines = j.split("\n");
        const firstLine = jourLines[0] || "";
        const dayMatch = firstLine.match(/JOUR\s*\d+/i);
        const dayLabel = dayMatch ? dayMatch[0] : `Jour ${i + 1}`;
        const restOfFirstLine = firstLine.replace(/JOUR\s*\d+/i, "").trim();
        const text = [restOfFirstLine, ...jourLines.slice(1)].join(" ").trim();
        return { day: dayLabel, title: "", text };
      });

      const durationStr =
        mJours && mNuits ? `${mJours[1]} jours / ${mNuits[1]} nuits` : mJours ? `${mJours[1]} jours` : "";

      setForm((prev) => ({
        ...prev,
        title: destinationLine || titleLine || prev.title,
        destination: destinationLine || prev.destination,
        country: mPays ? mPays[1].trim() : prev.country,
        level: mNiveau ? mNiveau[1].trim() : prev.level,
        accommodation: mHebergement ? mHebergement[1].trim() : prev.accommodation,
        transport: mTransport ? mTransport[1].trim() : prev.transport,
        duration: durationStr || prev.duration,
        price: mPrix ? `${mPrix[1]} €` : prev.price,
        visitBudget: mBudget ? `Environ ${mBudget[1]} € par personne` : prev.visitBudget,
        objectivesText: objectives.length ? objectives.join("\n") : prev.objectivesText,
        programText: programDays.length
          ? programDays.map((p) => `${p.day} | ${p.title} | ${p.text}`).join("\n")
          : prev.programText,
        slug: prev.slug || slugify(destinationLine || titleLine || ""),
      }));

      setOcrStatus(
        `Lecture terminée : ${programDays.length} jour(s) de programme détecté(s)${
          usedFallback ? " (numérotation automatique, badges non lisibles)" : ""
        }. Vérifie et complète les champs ci-dessous avant d'enregistrer — région et thème ne sont jamais détectés automatiquement.`
      );
    } catch {
      setOcrStatus("Échec de la lecture de l'image. Réessaie avec une photo plus nette.");
    }
  }

  async function handleSave() {
    if (!form.title || !form.country) {
      setSaveStatus("Titre et pays sont au minimum nécessaires avant d'enregistrer.");
      return;
    }
    setSaveStatus("Enregistrement...");

    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      destination: form.destination || form.title,
      country: form.country,
      region: form.region,
      language: form.language,
      duration: form.duration,
      level: form.level,
      accommodation: form.accommodation,
      transport: form.transport,
      price: form.price,
      image: "",
      badge: null,
      featured: false,
      hidden: form.hidden,
      theme: form.theme || null,
      description: form.description || null,
      objectives: form.objectivesText.split("\n").map((l) => l.trim()).filter(Boolean),
      program: textToProgram(form.programText),
      visit_budget: form.visitBudget || null,
      possible_visits: form.possibleVisits || null,
    };

    const { error } = await supabase.from("sejours").upsert(payload, { onConflict: "slug" });
    if (error) {
      console.error("Erreur Supabase (insert sejours):", error);
      setSaveStatus(`Erreur : ${error.message || error.code || "voir console"}`);
      return;
    }
    setSaveStatus(
      `Fiche "${form.title}" enregistrée ${form.hidden ? "(masquée, à publier depuis l'onglet Fiches voyages)" : "et publiée"} ✓`
    );
  }

  if (!isLogged) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <a href="/admin" className="admin-back">
            Retour au dashboard admin
          </a>
          <h1>Import de fiche</h1>
          <p>Connecte-toi depuis le dashboard admin pour accéder à cet outil.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <Script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js" strategy="lazyOnload" />

      <aside className="admin-sidebar">
        <div className="admin-brand">
          Scolamove
          <span>Import de fiche</span>
        </div>
        <nav className="admin-menu">
          <a href="/admin">Retour dashboard</a>
        </nav>
      </aside>

      <section className="admin-content" style={{ maxWidth: 860 }}>
        <div className="admin-topbar">
          <div>
            <span>Administration</span>
            <h1>Importer une fiche séjour</h1>
          </div>
        </div>

        <p style={{ color: "#6b7268", fontSize: 13, marginBottom: 20 }}>
          Uploade une photo ou capture d&apos;écran de fiche séjour (comme celles du catalogue
          Scolamove) : le texte est lu automatiquement et les champs ci-dessous sont pré-remplis.
          Vérifie tout avant d&apos;enregistrer — la fiche est créée masquée par défaut.
        </p>

        <div className="admin-panel">
          <h2>1. Importer la fiche</h2>
          <label>
            Photo / capture d&apos;écran de la fiche
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFicheUpload(file);
              }}
            />
          </label>
          {ocrStatus && <p style={{ fontSize: 12.5, color: "#6b7268", marginTop: 8 }}>{ocrStatus}</p>}
          {ocrRawText && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 11, color: "#6b7268" }}>
                Voir le texte brut détecté (debug)
              </summary>
              <textarea readOnly value={ocrRawText} rows={10} style={{ width: "100%", marginTop: 8, fontSize: 11, fontFamily: "monospace" }} />
            </details>
          )}
        </div>

        <div className="admin-panel" style={{ marginTop: 16 }}>
          <h2>2. Vérifier et compléter</h2>
          <div className="admin-form-grid two">
            <label>
              Titre
              <input value={form.title} onChange={(e) => update("title", e.target.value)} />
            </label>
            <label>
              Destination
              <input value={form.destination} onChange={(e) => update("destination", e.target.value)} />
            </label>

            <label>
              Pays
              <input
                list="pays-list"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
              <datalist id="pays-list">
                {countries.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <label>
              Région <span style={{ fontWeight: 400, color: "#e8683a" }}>(jamais détectée par l&apos;OCR — choisis dans la liste existante)</span>
              <input
                list="region-list"
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                placeholder="Ex : Andalousie"
              />
              <datalist id="region-list">
                {regions.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </label>

            <label>
              Thème <span style={{ fontWeight: 400, color: "#e8683a" }}>(jamais détecté — choisis dans la liste existante)</span>
              <input
                list="theme-list"
                value={form.theme}
                onChange={(e) => update("theme", e.target.value)}
              />
              <datalist id="theme-list">
                {themes.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </label>

            <label>
              Niveau
              <input
                list="level-list"
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
              />
              <datalist id="level-list">
                {levels.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </label>

            <label>
              Langue
              <input value={form.language} onChange={(e) => update("language", e.target.value)} placeholder="Ex : Espagnol" />
            </label>
            <label>
              Durée
              <input value={form.duration} onChange={(e) => update("duration", e.target.value)} />
            </label>
            <label>
              Hébergement
              <input value={form.accommodation} onChange={(e) => update("accommodation", e.target.value)} />
            </label>
            <label>
              Transport
              <input value={form.transport} onChange={(e) => update("transport", e.target.value)} />
            </label>
            <label>
              Prix
              <input value={form.price} onChange={(e) => update("price", e.target.value)} />
            </label>
            <label>
              Budget visites
              <input value={form.visitBudget} onChange={(e) => update("visitBudget", e.target.value)} />
            </label>
            <label>
              Slug (identifiant unique)
              <input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
            </label>
          </div>

          <label style={{ marginTop: 14 }}>
            Description
            <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </label>

          <label style={{ marginTop: 14 }}>
            Objectifs pédagogiques (un par ligne)
            <textarea rows={4} value={form.objectivesText} onChange={(e) => update("objectivesText", e.target.value)} />
          </label>

          <label style={{ marginTop: 14 }}>
            Programme — format : Jour | Titre | Texte (un par ligne)
            <textarea rows={8} value={form.programText} onChange={(e) => update("programText", e.target.value)} style={{ fontFamily: "monospace", fontSize: 12.5 }} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
            <input type="checkbox" checked={form.hidden} onChange={(e) => update("hidden", e.target.checked)} style={{ width: "auto" }} />
            Créer masquée (recommandé — la publier ensuite depuis l&apos;onglet Fiches voyages)
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center" }}>
          <button type="button" onClick={handleSave}>
            Enregistrer la fiche
          </button>
          {saveStatus && <span style={{ fontSize: 12.5, color: "#3d5a45" }}>{saveStatus}</span>}
        </div>
      </section>
    </main>
  );
}
