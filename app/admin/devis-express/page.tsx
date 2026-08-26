"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Script from "next/script";

type ZoneKey =
  | "france"
  | "france-loin"
  | "benelux"
  | "espagne"
  | "portugal"
  | "italie"
  | "uk"
  | "irlande"
  | "europe-est"
  | "europe-centrale"
  | "lointain";

type ZoneRatios = { t: number; h: number; r: number; a: number };

const ZONES: Record<ZoneKey, { label: string; ratios: ZoneRatios }> = {
  france: { label: "France proche (<400km)", ratios: { t: 25, h: 15, r: 13, a: 5 } },
  "france-loin": { label: "France lointaine", ratios: { t: 31, h: 19, r: 17, a: 6 } },
  benelux: { label: "Bénélux", ratios: { t: 31, h: 19, r: 17, a: 6 } },
  espagne: { label: "Espagne", ratios: { t: 35, h: 20, r: 17, a: 6 } },
  portugal: { label: "Portugal", ratios: { t: 42, h: 24, r: 21, a: 7 } },
  italie: { label: "Italie", ratios: { t: 42, h: 31, r: 21, a: 6 } },
  uk: { label: "Royaume-Uni (ferry, tunnel)", ratios: { t: 38, h: 23, r: 20, a: 7 } },
  irlande: { label: "Irlande (ferry)", ratios: { t: 48, h: 29, r: 25, a: 8 } },
  "europe-est": { label: "Allemagne", ratios: { t: 31, h: 19, r: 16, a: 6 } },
  "europe-centrale": {
    label: "Europe Centrale (Tchéquie, Pologne, Hongrie, Roumanie)",
    ratios: { t: 47, h: 29, r: 24, a: 9 },
  },
  lointain: { label: "Long courrier (avion, hors transport)", ratios: { t: 0, h: 30, r: 19, a: 7 } },
};

const ADMIN_PASSWORD_FLAG = "scolamove-admin";

function genRef() {
  const d = new Date();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SM-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${rand}`;
}

declare global {
  interface Window {
    Tesseract?: {
      recognize: (
        file: File,
        lang: string,
        opts: { logger: (m: { status: string; progress: number }) => void }
      ) => Promise<{ data: { text: string } }>;
    };
  }
}

export default function DevisExpressPage() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(localStorage.getItem(ADMIN_PASSWORD_FLAG) === "true");
  }, []);

  // --- Voyage ---
  const [zone, setZone] = useState<ZoneKey>("italie");
  const [jours, setJours] = useState(7);
  const [nuits, setNuits] = useState(4);
  const [eleves, setEleves] = useState(45);
  const [accomp, setAccomp] = useState(4);

  // --- Niveau & marge ---
  const [confort, setConfort] = useState<"0.85" | "1" | "1.25">("1");
  const [visites, setVisites] = useState(8);
  const [marge, setMarge] = useState(5);

  // --- Transport ---
  const [sousTraite, setSousTraite] = useState(false);
  const [margeTransport, setMargeTransport] = useState(20);

  // --- Ratios ajustables (seedés par zone) ---
  const [ratios, setRatios] = useState<ZoneRatios>(ZONES.italie.ratios);
  useEffect(() => {
    setRatios(ZONES[zone].ratios);
  }, [zone]);

  // --- Options tarifaires ---
  const [assuranceCheck, setAssuranceCheck] = useState(false);
  const [assurancePct, setAssurancePct] = useState(2.5);
  const [assuranceMin, setAssuranceMin] = useState(6);
  const [taxeSejourCheck, setTaxeSejourCheck] = useState(false);
  const [taxeSejourMontant, setTaxeSejourMontant] = useState(1.5);
  const [cautionCheck, setCautionCheck] = useState(false);
  const [cautionMontant, setCautionMontant] = useState(10);
  const [chambreIndivCheck, setChambreIndivCheck] = useState(false);
  const [chambreIndivMontant, setChambreIndivMontant] = useState(25);

  // --- Identification devis ---
  const [etablissement, setEtablissement] = useState("");
  const [ville, setVille] = useState("");
  const [reference, setReference] = useState("");
  const [dateVoyage, setDateVoyage] = useState("");
  useEffect(() => {
    setReference(genRef());
  }, []);

  // --- Programme & OCR ---
  const [programme, setProgramme] = useState("");
  const [prixParVisite, setPrixParVisite] = useState(6);
  const [estimateMsg, setEstimateMsg] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState("");
  const [copyState, setCopyState] = useState("");

  const result = useMemo(() => {
    const pax = eleves + accomp;
    const niveauFactor = parseFloat(confort);
    const groupFactor = pax < 20 ? 1.4 : pax < 40 ? 1.15 : pax < 60 ? 1.0 : 0.95;

    const coachBase = 43;
    const transportFactor = coachBase / Math.max(pax, 1);
    const transportTotal = ratios.t * Math.max(jours, 1) * transportFactor;
    const hebergTotal = ratios.h * nuits * niveauFactor * groupFactor;
    const joursPension = Math.max(nuits + 1, 1);
    const repasTotal = ratios.r * joursPension * niveauFactor;
    const assistTotal = ratios.a * Math.max(jours, 1);
    const visitesTotal = visites * joursPension;

    const transportCost = transportTotal * (sousTraite ? 1 : 0.7);
    const transportMargePct = sousTraite ? marge : margeTransport;
    const transportWithMarge = transportCost * (1 + transportMargePct / 100);

    const restTotal = hebergTotal + repasTotal + assistTotal + visitesTotal;
    const restWithMarge = restTotal * (1 + marge / 100);

    const avecMarge = transportWithMarge + restWithMarge;

    const assuranceMontant = assuranceCheck
      ? Math.max((avecMarge * assurancePct) / 100, assuranceMin)
      : 0;
    const taxeSejourTotal = taxeSejourCheck ? taxeSejourMontant * nuits : 0;
    const chambreIndivTotalGroupe = chambreIndivCheck
      ? chambreIndivMontant * nuits * accomp
      : 0;

    const prixFerme = avecMarge + assuranceMontant + taxeSejourTotal;

    return {
      pax,
      transportTotal,
      hebergTotal,
      repasTotal,
      assistTotal,
      visitesTotal,
      transportCost,
      transportMargePct,
      transportWithMarge,
      avecMarge,
      assuranceMontant,
      taxeSejourTotal,
      chambreIndivTotalGroupe,
      prixFerme,
      joursPension,
    };
  }, [
    eleves,
    accomp,
    confort,
    ratios,
    jours,
    nuits,
    visites,
    sousTraite,
    marge,
    margeTransport,
    assuranceCheck,
    assurancePct,
    assuranceMin,
    taxeSejourCheck,
    taxeSejourMontant,
    cautionCheck,
    chambreIndivCheck,
    chambreIndivMontant,
  ]);

  function estimateVisites() {
    if (!programme.trim()) {
      setEstimateMsg("Colle d'abord un programme dans le champ ci-dessus.");
      return;
    }
    const motsClefs =
      /\b(visite|musée|excursion|découverte|monument|château|parc|aquarium|atelier|entrée|billet)\b/gi;
    const lignes = programme.split("\n");
    let nbDetecte = 0;
    lignes.forEach((l) => {
      motsClefs.lastIndex = 0;
      if (motsClefs.test(l)) nbDetecte++;
    });
    const budgetTotal = nbDetecte * prixParVisite;
    const budgetParJour = result.joursPension > 0 ? budgetTotal / result.joursPension : budgetTotal;
    setEstimateMsg(
      `${nbDetecte} ligne(s) avec activité détectée × ${prixParVisite.toFixed(
        2
      )} € ≈ ${budgetTotal.toFixed(2)} € par personne sur le séjour (soit ~${budgetParJour.toFixed(
        2
      )} €/jour).`
    );
  }

  function applyEstimate() {
    const motsClefs =
      /\b(visite|musée|excursion|découverte|monument|château|parc|aquarium|atelier|entrée|billet)\b/gi;
    const lignes = programme.split("\n");
    let nbDetecte = 0;
    lignes.forEach((l) => {
      motsClefs.lastIndex = 0;
      if (motsClefs.test(l)) nbDetecte++;
    });
    const budgetTotal = nbDetecte * prixParVisite;
    const budgetParJour = result.joursPension > 0 ? budgetTotal / result.joursPension : budgetTotal;
    setVisites(Number(budgetParJour.toFixed(2)));
    setEstimateMsg((prev) => (prev ? prev + " — appliqué ✓" : "Appliqué ✓"));
  }

  async function handleFicheUpload(file: File) {
    if (typeof window === "undefined" || !window.Tesseract) {
      setOcrStatus(
        "La lecture d'image n'a pas pu se charger (connexion internet requise). Réessaie avec une connexion active."
      );
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
      const jourRegex = /JOUR\s*\d+[^\n]*(?:\n(?!JOUR\s*\d+|BUDGET|AUTRES)[^\n]*)*/gi;
      const joursTrouves = text.match(jourRegex) || [];
      if (joursTrouves.length) {
        setProgramme(joursTrouves.map((j) => j.trim()).join("\n\n"));
      }
      const mJours = text.match(/(\d+)\s*JOURS?/i);
      const mNuits = text.match(/(\d+)\s*NUITS?/i);
      if (mJours) setJours(Number(mJours[1]));
      if (mNuits) setNuits(Number(mNuits[1]));

      const mBudget =
        text.match(/budget\s*visites?[\s\S]{0,100}?(\d+[.,]?\d*)\s*€/i) ||
        text.match(/environ\s*(\d+[.,]?\d*)\s*€/i);
      let budgetMsg = "";
      if (mBudget) {
        const budgetDetecte = parseFloat(mBudget[1].replace(",", "."));
        const jP = Math.max((mNuits ? Number(mNuits[1]) : nuits) + 1, 1);
        const parJour = budgetDetecte / jP;
        setVisites(Number(parJour.toFixed(2)));
        budgetMsg = ` Budget visites détecté : ${budgetDetecte.toFixed(
          2
        )} €/pers, appliqué (~${parJour.toFixed(2)} €/jour).`;
      }
      const mPrixCatalogue = text.match(/à\s*partir\s*de\s*(\d+[.,]?\d*)\s*€/i);
      const prixMsg = mPrixCatalogue
        ? ` Prix catalogue détecté : ${mPrixCatalogue[1]} €/pers (comparaison uniquement).`
        : "";

      setOcrStatus(
        `${joursTrouves.length} jour(s) de programme détecté(s) et inséré(s).${budgetMsg}${prixMsg} Vérifie le texte — l'OCR peut contenir des erreurs.`
      );
    } catch {
      setOcrStatus("Échec de la lecture de l'image. Réessaie avec une photo plus nette, ou colle le texte manuellement.");
    }
  }

  function buildDevisHtml() {
    const zoneLabel = ZONES[zone].label;
    const refVal = reference || genRef();
    const dateStr = new Date().toLocaleDateString("fr-FR");
    const etabStr = [etablissement, ville].filter(Boolean).join(" — ") || "Établissement scolaire";
    const periodeStr = dateVoyage || `${jours} jours / ${nuits} nuits (dates à préciser)`;
    const sejourTotal = result.prixFerme - result.visitesTotal;

    const comprend = [
      sousTraite
        ? "Le transport en autocar, depuis votre établissement, aller et retour, et son utilisation sur place pour le programme des visites"
        : "Le transport en autocar de la flotte Festimove, depuis votre établissement, aller et retour, et son utilisation sur place pour le programme des visites",
      "Les repas et l'hébergement des chauffeurs, ainsi que les frais de parking, autoroutes et péages",
      `L'hébergement en pension complète (${nuits} nuits)`,
      taxeSejourCheck ? "Les taxes de séjour" : "Les taxes de séjour, quand applicables",
      assuranceCheck ? "L'assurance annulation" : "Une prestation d'assistance et de rapatriement en cas d'accident grave",
      "Une permanence téléphonique 24h/24 durant votre voyage",
      "La réservation des sites et musées quand elle est obligatoire",
      "De la documentation pédagogique à télécharger",
    ];
    const nComprend = [
      "Les repas du voyage aller et retour, ainsi que les repas proposés en option",
      assuranceCheck ? null : "L'assurance annulation, proposée en option",
      taxeSejourCheck ? null : "Les taxes de séjour, quand applicables sur place",
      cautionCheck
        ? `L'éventuelle caution demandée sur place par certains hébergements (environ ${cautionMontant.toFixed(2)} € par personne, restituée en fin de séjour)`
        : "L'éventuelle caution demandée sur place par certains hébergements (restituée en fin de séjour)",
      chambreIndivCheck
        ? `Le supplément chambre individuelle (${chambreIndivMontant.toFixed(2)} €/nuit/accompagnateur, sur demande)`
        : "Le supplément chambre individuelle",
      "Les dépenses personnelles",
      'Tout ce qui n\'est pas mentionné dans "Le prix comprend"',
    ].filter(Boolean);

    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<title>Devis ${refVal} — Scolamove</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#292420;max-width:760px;margin:0 auto;padding:40px 46px;background:#fff;line-height:1.55;}
  .letterhead{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #8ec63f;padding-bottom:14px;margin-bottom:26px;}
  .lh-coords{font-family:'Helvetica Neue',Arial,sans-serif;font-size:10.5px;color:#777;text-align:right;line-height:1.6;}
  .addr-block{display:flex;justify-content:space-between;margin-bottom:28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12.5px;}
  .addr-dest .name{font-weight:700;margin-bottom:2px;color:#1a1a1a;}
  .addr-meta{text-align:right;color:#555;}
  .ref-line{font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;margin-bottom:22px;color:#444;}
  .ref-line b{font-weight:700;color:#e8683a;}
  p.letter{font-size:13.5px;margin:0 0 14px;}
  .offer-title{font-family:'Helvetica Neue',Arial,sans-serif;text-align:center;font-size:14px;font-weight:800;letter-spacing:0.04em;color:#fff;background:linear-gradient(90deg,#e8683a,#f0925f);border-radius:6px;padding:11px;margin:26px 0 18px;text-transform:uppercase;}
  .programme-block{margin:22px 0;}
  .programme-block pre{font-family:Georgia,'Times New Roman',serif;font-size:12.5px;white-space:pre-wrap;line-height:1.6;border-left:3px solid #8ec63f;padding-left:14px;margin:0;}
  table.pd-meta{width:100%;border-collapse:collapse;margin-bottom:20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12.5px;}
  table.pd-meta td{padding:8px 10px;border:1px solid #e2ddd0;}
  table.pd-meta .pd-lbl{background:#faf7f0;font-weight:700;width:22%;color:#3d5a45;}
  table.pd-offre{width:100%;border-collapse:collapse;margin-bottom:6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;}
  table.pd-offre td{padding:10px 12px;border:1px solid #e2ddd0;}
  table.pd-offre td:last-child{text-align:right;font-variant-numeric:tabular-nums;width:130px;font-weight:600;}
  .pd-offre-head td{font-weight:700;background:#3d5a45;color:#fff;border-color:#3d5a45;}
  .pd-total-box{background:linear-gradient(135deg,#8ec63f,#6fae2a);border-radius:10px;padding:20px;text-align:center;margin:18px 0 26px;font-family:'Helvetica Neue',Arial,sans-serif;box-shadow:0 4px 14px rgba(110,170,40,0.25);}
  .pd-total-line{font-size:19px;font-weight:800;color:#fff;margin-bottom:5px;letter-spacing:0.01em;}
  .pd-total-pers{font-size:13.5px;color:#eaf6da;font-weight:600;}
  .section-title{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#3d5a45;background:#eef5e5;border-left:3px solid #8ec63f;padding:7px 10px;margin:22px 0 8px;}
  ul.section-list{margin:0 0 4px;padding-left:20px;font-size:12.5px;font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.7;color:#444;}
  .signoff{margin-top:30px;font-size:13px;}
  .signoff .name{font-weight:700;margin-top:18px;color:#3d5a45;}
  .legal-footer{margin-top:34px;padding-top:12px;border-top:1px solid #e2ddd0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:9.5px;color:#999;text-align:center;line-height:1.6;}
  @media print{ body{padding:20px;} .pd-total-box,.offer-title,.pd-offre-head td{-webkit-print-color-adjust:exact;print-color-adjust:exact;} }
</style></head>
<body>
  <div class="letterhead">
    <div><strong style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;">Scolamove</strong></div>
    <div class="lh-coords">Scolamove — Agence de voyages scolaires<br>voyages@scolamove.fr</div>
  </div>
  <div class="addr-block">
    <div class="addr-dest"><div class="name">${etabStr}</div></div>
    <div class="addr-meta">${dateStr}</div>
  </div>
  <div class="ref-line">Votre référence de voyage est : <b>${refVal}</b></div>
  <p class="letter">Bonjour,</p>
  <p class="letter">Nous avons le plaisir de vous adresser ci-après notre proposition pour votre projet de voyage scolaire :</p>
  <table class="pd-meta">
    <tr><td class="pd-lbl">Destination</td><td colspan="3">${zoneLabel}</td></tr>
    <tr><td class="pd-lbl">Effectif</td><td>${eleves} élèves et ${accomp} accompagnateurs</td><td class="pd-lbl">Période</td><td>${periodeStr}</td></tr>
  </table>
  <p class="letter">Je reste à votre disposition pour l'organisation de ce voyage et faire en sorte que votre projet puisse se concrétiser.</p>
  ${programme.trim() ? `<div class="section-title">Programme du séjour</div><div class="programme-block"><pre>${programme.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string))}</pre></div>` : ""}
  <div class="offer-title">Devis ${zoneLabel}</div>
  <table class="pd-offre">
    <tr class="pd-offre-head"><td>Détail de l'offre</td><td>Montants</td></tr>
    <tr><td>Prix du séjour (voyage à forfait)</td><td>${sejourTotal.toFixed(2)} €</td></tr>
    <tr><td>Visites / activités</td><td>${result.visitesTotal.toFixed(2)} €</td></tr>
    ${assuranceCheck ? `<tr><td>Assurance annulation</td><td>${result.assuranceMontant.toFixed(2)} €</td></tr>` : ""}
    ${taxeSejourCheck ? `<tr><td>Taxe de séjour (${nuits} nuits)</td><td>${result.taxeSejourTotal.toFixed(2)} €</td></tr>` : ""}
  </table>
  <div class="pd-total-box">
    <div class="pd-total-line">Le coût du voyage est de ${(result.prixFerme * result.pax).toFixed(2)} €</div>
    <div class="pd-total-pers">Soit ${result.prixFerme.toFixed(2)} € par personne (élèves et adultes)</div>
    ${cautionCheck ? `<div class="pd-total-pers" style="margin-top:6px;font-style:italic;">+ Caution hôtel d'environ ${cautionMontant.toFixed(2)} € par personne, à régler sur place et restituée en fin de séjour (non incluse au prix ci-dessus)</div>` : ""}
    ${chambreIndivCheck ? `<div class="pd-total-pers" style="margin-top:6px;font-style:italic;">+ Chambre individuelle accompagnateurs (en option) : ${chambreIndivMontant.toFixed(2)} € par nuit et par accompagnateur, sur demande</div>` : ""}
  </div>
  <div class="section-title">Le prix comprend</div>
  <ul class="section-list">${comprend.map((l) => `<li>${l}</li>`).join("")}</ul>
  <div class="section-title">Le prix ne comprend pas</div>
  <ul class="section-list">${nComprend.map((l) => `<li>${l}</li>`).join("")}</ul>
  <div class="section-title">Conditions tarifaires</div>
  <ul class="section-list"><li>Tarifs valables sous réserve de disponibilité dans les hébergements choisis et auprès de notre partenaire autocariste au moment de la réservation.</li><li>Cette offre est une estimation et ne constitue pas un devis contractuel. Un devis détaillé et personnalisé sera établi dès validation de votre projet.</li></ul>
  <div class="signoff">Bien cordialement,<div class="name">Jérémy — Scolamove</div></div>
  <div class="legal-footer">Scolamove — Agence de voyages scolaires · Ce document est une estimation non contractuelle établie à titre indicatif.</div>
</body></html>`;
  }

  function handleDownload() {
    const html = buildDevisHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis-${reference || genRef()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function handleCopyEmail() {
    const zoneLabel = ZONES[zone].label;
    const texte = `Bonjour,

Suite à votre demande, voici notre proposition pour votre projet de voyage scolaire :

Destination : ${zoneLabel}
Durée : ${jours} jours / ${nuits} nuits
Effectif : ${eleves} élèves + ${accomp} accompagnateurs (${result.pax} personnes)

Prix : ${result.prixFerme.toFixed(0)} € par personne, soit ${(result.prixFerme * result.pax).toFixed(0)} € pour le groupe, sous réserve de disponibilités auprès de nos partenaires (hébergement) au moment de la réservation.
${assuranceCheck ? `(dont assurance annulation incluse : ${result.assuranceMontant.toFixed(2)} €/pers)\n` : ""}${taxeSejourCheck ? `(dont taxe de séjour incluse : ${result.taxeSejourTotal.toFixed(2)} €/pers)\n` : ""}${cautionCheck ? `Une caution hôtel d'environ ${cautionMontant.toFixed(2)} €/pers sera à régler sur place (restituée en fin de séjour, non incluse au prix).\n` : ""}${chambreIndivCheck ? `Option chambre individuelle pour les accompagnateurs disponible : +${chambreIndivMontant.toFixed(2)} €/nuit/accompagnateur.\n` : ""}
Un devis détaillé et personnalisé vous sera adressé dès validation de votre intérêt pour le projet.

N'hésitez pas à revenir vers nous pour toute précision.

Cordialement,
Jérémy — Scolamove`;

    try {
      await navigator.clipboard.writeText(texte);
      setCopyState("Copié ✓");
    } catch {
      setCopyState("Copie impossible — sélectionne le texte manuellement.");
    }
    setTimeout(() => setCopyState(""), 2500);
  }

  if (!isLogged) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <a href="/admin" className="admin-back">
            Retour au dashboard admin
          </a>
          <h1>Devis Express</h1>
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
          <span>Devis Express</span>
        </div>
        <nav className="admin-menu">
          <a href="/admin">Retour dashboard</a>
          <a href="/" target="_blank" rel="noreferrer">
            Voir le site
          </a>
        </nav>
      </aside>

      <section className="admin-content" style={{ maxWidth: 920 }}>
        <div className="admin-topbar">
          <div>
            <span>Administration</span>
            <h1>Devis Express</h1>
          </div>
          <Image src="/images/logo-scolamove.png" alt="Scolamove" width={140} height={40} style={{ objectFit: "contain" }} />
        </div>

        <p style={{ color: "#6b7268", fontSize: 13, marginBottom: 20 }}>
          Estimation instantanée par ratios moyens — sans sourcing détaillé. À envoyer en première
          réponse client ; le devis ferme se construit uniquement après accord de principe.
        </p>

        {/* Identification */}
        <div className="admin-panel">
          <h2>Identification du devis</h2>
          <div className="admin-form-grid two">
            <label>
              Établissement
              <input value={etablissement} onChange={(e) => setEtablissement(e.target.value)} placeholder="Collège / Lycée..." />
            </label>
            <label>
              Ville
              <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville de l'établissement" />
            </label>
            <label>
              Référence
              <input value={reference} onChange={(e) => setReference(e.target.value)} />
            </label>
            <label>
              Période du voyage
              <input value={dateVoyage} onChange={(e) => setDateVoyage(e.target.value)} placeholder="du .../.../... au .../.../..." />
            </label>
          </div>
        </div>

        {/* Voyage & marges */}
        <div className="admin-panel">
          <h2>Le voyage</h2>
          <div className="admin-form-grid two">
            <label>
              Destination / zone
              <select value={zone} onChange={(e) => setZone(e.target.value as ZoneKey)}>
                {Object.entries(ZONES).map(([key, z]) => (
                  <option key={key} value={key}>
                    {z.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Niveau de confort
              <select value={confort} onChange={(e) => setConfort(e.target.value as "0.85" | "1" | "1.25")}>
                <option value="0.85">Économique</option>
                <option value="1">Standard</option>
                <option value="1.25">Confort</option>
              </select>
            </label>
            <label>
              Jours (amplitude)
              <input type="number" value={jours} min={1} onChange={(e) => setJours(Number(e.target.value))} />
            </label>
            <label>
              Nuits sur place
              <input type="number" value={nuits} min={0} onChange={(e) => setNuits(Number(e.target.value))} />
            </label>
            <label>
              Élèves
              <input type="number" value={eleves} min={1} onChange={(e) => setEleves(Number(e.target.value))} />
            </label>
            <label>
              Accompagnateurs
              <input type="number" value={accomp} min={0} onChange={(e) => setAccomp(Number(e.target.value))} />
            </label>
            <label>
              Budget visites/activités (€/jour/pers)
              <input type="number" value={visites} min={0} onChange={(e) => setVisites(Number(e.target.value))} />
            </label>
            <label>
              Marge — hébergement/repas/visites (%)
              <input type="number" value={marge} min={0} onChange={(e) => setMarge(Number(e.target.value))} />
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
            <input type="checkbox" checked={sousTraite} onChange={(e) => setSousTraite(e.target.checked)} style={{ width: "auto" }} />
            Sous-traiter le transport (autocariste tiers)
          </label>
          <div className="admin-form-grid two" style={{ marginTop: 8 }}>
            <label>
              Marge transport {sousTraite ? "(sous-traité)" : "(flotte propre)"} (%)
              <input type="number" value={margeTransport} min={0} onChange={(e) => setMargeTransport(Number(e.target.value))} />
            </label>
          </div>
          <p style={{ fontSize: 11, color: "#6b7268", marginTop: 8 }}>
            Par défaut, transport assuré par la flotte Festimove : coût réel estimé à ~70% du tarif
            marché, ratio calibré sur un car de 43 places (le plus petit de la flotte).
          </p>

          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: "pointer", fontSize: 12, color: "#6b7268", textTransform: "uppercase" }}>
              Ajuster les ratios de base (€/jour/pers) ▾
            </summary>
            <div className="admin-form-grid two" style={{ marginTop: 10 }}>
              <label>
                Transport
                <input type="number" value={ratios.t} onChange={(e) => setRatios({ ...ratios, t: Number(e.target.value) })} />
              </label>
              <label>
                Hébergement (€/nuit)
                <input type="number" value={ratios.h} onChange={(e) => setRatios({ ...ratios, h: Number(e.target.value) })} />
              </label>
              <label>
                Pension complète (€/jour)
                <input type="number" value={ratios.r} onChange={(e) => setRatios({ ...ratios, r: Number(e.target.value) })} />
              </label>
              <label>
                Assistance / gestion (€/jour)
                <input type="number" value={ratios.a} onChange={(e) => setRatios({ ...ratios, a: Number(e.target.value) })} />
              </label>
            </div>
          </details>
        </div>

        {/* Options tarifaires */}
        <div className="admin-panel">
          <h2>Options tarifaires (hors forfait)</h2>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={assuranceCheck} onChange={(e) => setAssuranceCheck(e.target.checked)} style={{ width: "auto" }} />
            Ajouter l&apos;assurance annulation au devis
          </label>
          <div className="admin-form-grid two" style={{ marginTop: 8 }}>
            <label>
              Taux (% du forfait)
              <input type="number" step={0.1} value={assurancePct} onChange={(e) => setAssurancePct(Number(e.target.value))} />
            </label>
            <label>
              Minimum par personne (€)
              <input type="number" value={assuranceMin} onChange={(e) => setAssuranceMin(Number(e.target.value))} />
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
            <input type="checkbox" checked={taxeSejourCheck} onChange={(e) => setTaxeSejourCheck(e.target.checked)} style={{ width: "auto" }} />
            Ajouter la taxe de séjour au devis
          </label>
          <label>
            Montant par nuit et par personne (€)
            <input type="number" step={0.1} value={taxeSejourMontant} onChange={(e) => setTaxeSejourMontant(Number(e.target.value))} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
            <input type="checkbox" checked={cautionCheck} onChange={(e) => setCautionCheck(e.target.checked)} style={{ width: "auto" }} />
            Mentionner la caution hôtel (à régler sur place, non incluse au prix)
          </label>
          <label>
            Montant par personne (€)
            <input type="number" value={cautionMontant} onChange={(e) => setCautionMontant(Number(e.target.value))} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
            <input type="checkbox" checked={chambreIndivCheck} onChange={(e) => setChambreIndivCheck(e.target.checked)} style={{ width: "auto" }} />
            Proposer la chambre individuelle pour les accompagnateurs
          </label>
          <label>
            Supplément par nuit et par accompagnateur (€)
            <input type="number" value={chambreIndivMontant} onChange={(e) => setChambreIndivMontant(Number(e.target.value))} />
          </label>
        </div>

        {/* Programme + OCR */}
        <div className="admin-panel">
          <h2>Programme du séjour (optionnel)</h2>
          <label>
            Colle ici le programme jour par jour (JOUR 1, JOUR 2...)
            <textarea rows={8} value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder={"JOUR 1 : Départ...\nJOUR 2 : Visite du site archéologique..."} />
          </label>
          <div className="admin-form-grid two" style={{ marginTop: 8 }}>
            <label>
              Prix moyen estimé par visite détectée (€)
              <input type="number" value={prixParVisite} onChange={(e) => setPrixParVisite(Number(e.target.value))} />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="button" onClick={estimateVisites}>
                Estimer le budget visites
              </button>
            </div>
          </div>
          {estimateMsg && (
            <p style={{ fontSize: 12.5, color: "#3d5a45", marginTop: 10 }}>
              {estimateMsg}{" "}
              <button type="button" onClick={applyEstimate} style={{ fontSize: 11, padding: "4px 8px" }}>
                Appliquer au champ visites
              </button>
            </p>
          )}

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px dashed #d8d3c4" }}>
            <label>
              Ou importer une fiche séjour (photo / capture d&apos;écran)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFicheUpload(file);
                }}
              />
            </label>
            {ocrStatus && <p style={{ fontSize: 12, color: "#6b7268", marginTop: 8 }}>{ocrStatus}</p>}
          </div>
        </div>

        {/* Résultat */}
        <div
          style={{
            background: "#1c2a24",
            color: "#f6f4ee",
            borderRadius: 8,
            padding: 24,
            margin: "20px 0",
          }}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a9b8ae" }}>
            Prix ferme
          </div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {result.prixFerme.toFixed(0)} € <small style={{ fontSize: 14, fontWeight: 400, color: "#a9b8ae" }}>/ personne</small>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, borderTop: "1px solid #3a4a3e", paddingTop: 14 }}>
            <div>Transport {sousTraite ? "(sous-traité)" : "(flotte Festimove)"} : {result.transportWithMarge.toFixed(0)} €</div>
            <div>Hébergement ({nuits} nuits) : {result.hebergTotal.toFixed(0)} €</div>
            <div>Pension complète ({jours} jours) : {result.repasTotal.toFixed(0)} €</div>
            <div>Visites / activités : {result.visitesTotal.toFixed(0)} €</div>
            <div>Assistance / gestion : {result.assistTotal.toFixed(0)} €</div>
            {assuranceCheck && <div>+ Assurance annulation : {result.assuranceMontant.toFixed(2)} €</div>}
            {taxeSejourCheck && <div>+ Taxe de séjour : {result.taxeSejourTotal.toFixed(2)} €</div>}
            {cautionCheck && <div style={{ fontStyle: "italic" }}>Caution hôtel (non incluse) : {cautionMontant.toFixed(2)} €</div>}
            {chambreIndivCheck && (
              <div style={{ fontStyle: "italic" }}>
                + Chambre individuelle accompagnateurs (option) : {result.chambreIndivTotalGroupe.toFixed(2)} € groupe
              </div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#a9b8ae" }}>
            Groupe de {result.pax} personnes ({eleves} élèves + {accomp} accompagnateurs) → coût total
            groupe : {(result.prixFerme * result.pax).toFixed(0)} €.
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: "#6b7268", background: "#efece2", borderLeft: "3px solid #c96a3b", padding: "12px 14px" }}>
          Ce prix est calculé à partir de ratios moyens et de vos marges. Il constitue une base de
          devis ferme, sous réserve de disponibilités au moment de la réservation.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" onClick={handleCopyEmail}>
            Copier le texte pour l&apos;email client
          </button>
          <button type="button" onClick={handleDownload} style={{ background: "#c96a3b", color: "#fff" }}>
            Télécharger le devis (PDF)
          </button>
          {copyState && <span style={{ fontSize: 12, color: "#3d5a45" }}>{copyState}</span>}
        </div>
      </section>
    </main>
  );
}
