"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Script from "next/script";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

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

  const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#292420" },
    letterhead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottomWidth: 3,
      borderBottomColor: "#8ec63f",
      paddingBottom: 10,
      marginBottom: 20,
    },
    brand: { fontFamily: "Helvetica-Bold", fontSize: 18, color: "#1a1a1a" },
    coords: { fontSize: 8, color: "#777", textAlign: "right", lineHeight: 1.5 },
    addrBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
    addrName: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#1a1a1a" },
    addrMeta: { fontSize: 10, color: "#555" },
    refLine: { fontSize: 9.5, marginBottom: 16, color: "#444" },
    refBold: { fontFamily: "Helvetica-Bold", color: "#e8683a" },
    letter: { fontSize: 10.5, marginBottom: 10, lineHeight: 1.5 },
    metaTable: { borderWidth: 1, borderColor: "#e2ddd0", marginBottom: 16 },
    metaRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2ddd0" },
    metaLabel: {
      width: "22%",
      backgroundColor: "#faf7f0",
      fontFamily: "Helvetica-Bold",
      color: "#3d5a45",
      fontSize: 9,
      padding: 6,
    },
    metaValue: { flex: 1, fontSize: 9.5, padding: 6 },
    programmeBlock: { marginVertical: 16 },
    programmeText: {
      fontSize: 9.5,
      lineHeight: 1.5,
      borderLeftWidth: 2,
      borderLeftColor: "#8ec63f",
      paddingLeft: 10,
    },
    offerTitle: {
      textAlign: "center",
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#fff",
      backgroundColor: "#e8683a",
      borderRadius: 4,
      padding: 8,
      marginVertical: 16,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    offerTable: { borderWidth: 1, borderColor: "#e2ddd0", marginBottom: 6 },
    offerHeadRow: { flexDirection: "row", backgroundColor: "#3d5a45" },
    offerHeadCell: { flex: 1, color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 9.5, padding: 7 },
    offerRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e2ddd0" },
    offerLabelCell: { flex: 1, fontSize: 9.5, padding: 7 },
    offerValueCell: { width: 90, fontSize: 9.5, padding: 7, textAlign: "right", fontFamily: "Helvetica-Bold" },
    totalBox: {
      backgroundColor: "#6fae2a",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginVertical: 18,
    },
    totalLine: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#fff", marginBottom: 4 },
    totalPers: { fontSize: 10, color: "#eaf6da", fontFamily: "Helvetica-Bold" },
    totalNote: { fontSize: 9, color: "#eaf6da", marginTop: 6, fontStyle: "italic" },
    sectionTitle: {
      fontSize: 8.5,
      fontFamily: "Helvetica-Bold",
      color: "#3d5a45",
      backgroundColor: "#eef5e5",
      borderLeftWidth: 3,
      borderLeftColor: "#8ec63f",
      padding: 6,
      marginTop: 16,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    listItem: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 3, color: "#444" },
    signoff: { marginTop: 22, fontSize: 10 },
    signoffName: { fontFamily: "Helvetica-Bold", marginTop: 12, color: "#3d5a45" },
    legalFooter: {
      marginTop: 26,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#e2ddd0",
      fontSize: 7.5,
      color: "#999",
      textAlign: "center",
    },
  });

  function DevisPdfDocument() {
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
    ].filter((l): l is string => Boolean(l));

    const programmeLines = programme.trim() ? programme.split("\n") : [];

    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.letterhead}>
            <Text style={pdfStyles.brand}>Scolamove</Text>
            <Text style={pdfStyles.coords}>Scolamove — Agence de voyages scolaires{"\n"}voyages@scolamove.fr</Text>
          </View>

          <View style={pdfStyles.addrBlock}>
            <Text style={pdfStyles.addrName}>{etabStr}</Text>
            <Text style={pdfStyles.addrMeta}>{dateStr}</Text>
          </View>

          <Text style={pdfStyles.refLine}>
            Votre référence de voyage est : <Text style={pdfStyles.refBold}>{refVal}</Text>
          </Text>

          <Text style={pdfStyles.letter}>Bonjour,</Text>
          <Text style={pdfStyles.letter}>
            Nous avons le plaisir de vous adresser ci-après notre proposition pour votre projet de voyage scolaire :
          </Text>

          <View style={pdfStyles.metaTable}>
            <View style={pdfStyles.metaRow}>
              <Text style={pdfStyles.metaLabel}>Destination</Text>
              <Text style={pdfStyles.metaValue}>{zoneLabel}</Text>
            </View>
            <View style={[pdfStyles.metaRow, { borderBottomWidth: 0 }]}>
              <Text style={pdfStyles.metaLabel}>Effectif</Text>
              <Text style={pdfStyles.metaValue}>{eleves} élèves et {accomp} accompagnateurs</Text>
            </View>
          </View>
          <View style={[pdfStyles.metaTable, { marginTop: -12 }]}>
            <View style={[pdfStyles.metaRow, { borderBottomWidth: 0 }]}>
              <Text style={pdfStyles.metaLabel}>Période</Text>
              <Text style={pdfStyles.metaValue}>{periodeStr}</Text>
            </View>
          </View>

          <Text style={pdfStyles.letter}>
            Je reste à votre disposition pour l&apos;organisation de ce voyage et faire en sorte que votre projet puisse se concrétiser.
          </Text>

          {programmeLines.length > 0 && (
            <View style={pdfStyles.programmeBlock}>
              <Text style={pdfStyles.sectionTitle}>Programme du séjour</Text>
              <View style={pdfStyles.programmeText}>
                {programmeLines.map((line, i) => (
                  <Text key={i} style={{ marginBottom: line.trim() === "" ? 4 : 1 }}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Text style={pdfStyles.offerTitle}>Devis {zoneLabel}</Text>

          <View style={pdfStyles.offerTable}>
            <View style={pdfStyles.offerHeadRow}>
              <Text style={pdfStyles.offerHeadCell}>Détail de l&apos;offre</Text>
              <Text style={[pdfStyles.offerHeadCell, { flex: 0, width: 90, textAlign: "right" }]}>Montants</Text>
            </View>
            <View style={pdfStyles.offerRow}>
              <Text style={pdfStyles.offerLabelCell}>Prix du séjour (voyage à forfait)</Text>
              <Text style={pdfStyles.offerValueCell}>{sejourTotal.toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.offerRow}>
              <Text style={pdfStyles.offerLabelCell}>Visites / activités</Text>
              <Text style={pdfStyles.offerValueCell}>{result.visitesTotal.toFixed(2)} €</Text>
            </View>
            {assuranceCheck && (
              <View style={pdfStyles.offerRow}>
                <Text style={pdfStyles.offerLabelCell}>Assurance annulation</Text>
                <Text style={pdfStyles.offerValueCell}>{result.assuranceMontant.toFixed(2)} €</Text>
              </View>
            )}
            {taxeSejourCheck && (
              <View style={pdfStyles.offerRow}>
                <Text style={pdfStyles.offerLabelCell}>Taxe de séjour ({nuits} nuits)</Text>
                <Text style={pdfStyles.offerValueCell}>{result.taxeSejourTotal.toFixed(2)} €</Text>
              </View>
            )}
          </View>

          <View style={pdfStyles.totalBox}>
            <Text style={pdfStyles.totalLine}>
              Le coût du voyage est de {(result.prixFerme * result.pax).toFixed(2)} €
            </Text>
            <Text style={pdfStyles.totalPers}>
              Soit {result.prixFerme.toFixed(2)} € par personne (élèves et adultes)
            </Text>
            {cautionCheck && (
              <Text style={pdfStyles.totalNote}>
                + Caution hôtel d&apos;environ {cautionMontant.toFixed(2)} € par personne, à régler sur place et restituée en fin de séjour (non incluse au prix ci-dessus)
              </Text>
            )}
            {chambreIndivCheck && (
              <Text style={pdfStyles.totalNote}>
                + Chambre individuelle accompagnateurs (en option) : {chambreIndivMontant.toFixed(2)} € par nuit et par accompagnateur, sur demande
              </Text>
            )}
          </View>

          <Text style={pdfStyles.sectionTitle}>Le prix comprend</Text>
          {comprend.map((l, i) => (
            <Text key={i} style={pdfStyles.listItem}>• {l}</Text>
          ))}

          <Text style={pdfStyles.sectionTitle}>Le prix ne comprend pas</Text>
          {nComprend.map((l, i) => (
            <Text key={i} style={pdfStyles.listItem}>• {l}</Text>
          ))}

          <Text style={pdfStyles.sectionTitle}>Conditions tarifaires</Text>
          <Text style={pdfStyles.listItem}>
            • Tarifs valables sous réserve de disponibilité dans les hébergements choisis et auprès de notre partenaire autocariste au moment de la réservation.
          </Text>
          <Text style={pdfStyles.listItem}>
            • Cette offre est une estimation et ne constitue pas un devis contractuel. Un devis détaillé et personnalisé sera établi dès validation de votre projet.
          </Text>

          <View style={pdfStyles.signoff}>
            <Text>Bien cordialement,</Text>
            <Text style={pdfStyles.signoffName}>Jérémy — Scolamove</Text>
          </View>

          <Text style={pdfStyles.legalFooter}>
            Scolamove — Agence de voyages scolaires · Ce document est une estimation non contractuelle établie à titre indicatif.
          </Text>
        </Page>
      </Document>
    );
  }

  async function handleDownload() {
    const blob = await pdf(<DevisPdfDocument />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis-${reference || genRef()}.pdf`;
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

      <section className="admin-content de-content" style={{ maxWidth: 960 }}>
        <style jsx>{`
          .de-content {
            background: linear-gradient(180deg, #f4f9f2 0%, #f7f9fb 340px, transparent 340px);
          }
          .de-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            background: linear-gradient(120deg, #123c3f 0%, #1c5450 60%, #4f9d7a 130%);
            border-radius: 22px;
            padding: 26px 30px;
            margin-bottom: 26px;
            box-shadow: 0 16px 34px rgba(18, 60, 63, 0.28);
          }
          .de-hero-title {
            color: #fff;
          }
          .de-hero-eyebrow {
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #d7f2c8;
            background: rgba(255, 255, 255, 0.12);
            padding: 4px 10px;
            border-radius: 999px;
            margin-bottom: 10px;
          }
          .de-hero h1 {
            color: #fff;
            font-size: 28px;
            margin: 0;
          }
          .de-hero p {
            color: #dcece2;
            font-size: 13px;
            margin: 8px 0 0;
            max-width: 480px;
          }
          .de-hero-logo {
            background: #fff;
            border-radius: 14px;
            padding: 10px 16px;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
          }

          .de-panel {
            margin-bottom: 22px;
            position: relative;
            border-top: 4px solid var(--panel-accent, var(--green));
            overflow: hidden;
          }
          .de-panel.identite { --panel-accent: #f6d77a; }
          .de-panel.voyage { --panel-accent: #4f9d7a; }
          .de-panel.options { --panel-accent: #e8683a; }
          .de-panel.programme { --panel-accent: #123c3f; }

          .de-panel-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
          }
          .de-panel-icon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            background: color-mix(in srgb, var(--panel-accent, var(--green)) 16%, white);
            flex-shrink: 0;
          }
          .de-panel-head h2 {
            margin: 0;
            font-size: 16px;
            color: var(--navy);
          }
          .de-panel-head .de-eyebrow {
            display: block;
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 2px;
          }

          .de-panel label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 12px;
            font-weight: 700;
            color: var(--muted);
            margin: 0;
          }
          .de-panel input[type="text"],
          .de-panel input[type="number"],
          .de-panel select,
          .de-panel textarea,
          .de-panel input:not([type]) {
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            color: var(--navy);
            padding: 11px 13px;
            border-radius: 12px;
            border: 1.5px solid #dce8f5;
            background: #fbfdff;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .de-panel input:focus,
          .de-panel select:focus,
          .de-panel textarea:focus {
            outline: none;
            border-color: #4f9d7a;
            box-shadow: 0 0 0 4px rgba(79, 157, 122, 0.15);
          }
          .de-panel input[type="file"] {
            border: 1.5px dashed #c8dceb;
            border-radius: 12px;
            padding: 14px;
            background: #fbfdff;
            font-size: 13px;
          }

          .de-check-row {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #fbfdff;
            border: 1.5px solid #e5eef8;
            border-radius: 14px;
            padding: 12px 14px;
            margin-top: 14px;
            transition: border-color 0.15s ease, background 0.15s ease;
          }
          .de-check-row:has(input:checked) {
            border-color: #4f9d7a;
            background: #f0f9ec;
          }
          .de-check-row input {
            width: 19px;
            height: 19px;
            accent-color: #4f9d7a;
          }
          .de-check-row span {
            font-size: 13px;
            font-weight: 700;
            color: var(--navy);
          }

          .de-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13.5px;
            font-weight: 800;
            padding: 12px 20px;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            transition: transform 0.12s ease, box-shadow 0.12s ease;
          }
          .de-btn:active {
            transform: translateY(1px);
          }
          .de-btn-primary {
            background: linear-gradient(120deg, #4f9d7a, #3d8064);
            color: #fff;
            box-shadow: 0 10px 20px rgba(79, 157, 122, 0.35);
          }
          .de-btn-primary:hover {
            box-shadow: 0 12px 26px rgba(79, 157, 122, 0.45);
          }
          .de-btn-accent {
            background: linear-gradient(120deg, #e8683a, #d85426);
            color: #fff;
            box-shadow: 0 10px 20px rgba(232, 104, 58, 0.35);
          }
          .de-btn-accent:hover {
            box-shadow: 0 12px 26px rgba(232, 104, 58, 0.45);
          }
          .de-btn-outline {
            background: #fff;
            color: var(--navy);
            border: 1.5px solid #dce8f5;
            font-size: 12px;
            padding: 8px 14px;
          }

          .de-result {
            background: linear-gradient(135deg, #123c3f 0%, #1c5450 55%, #2d6b58 100%);
            border-radius: 22px;
            padding: 28px 30px;
            margin: 24px 0;
            color: #f6f4ee;
            box-shadow: 0 18px 36px rgba(18, 60, 63, 0.3);
          }
          .de-result-eyebrow {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #b7d9c8;
            font-weight: 800;
          }
          .de-result-price {
            font-size: 42px;
            font-weight: 900;
            letter-spacing: -0.01em;
            margin: 6px 0 18px;
          }
          .de-result-price small {
            font-size: 15px;
            font-weight: 500;
            color: #b7d9c8;
            margin-left: 8px;
          }
          .de-result-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.18);
            padding-top: 18px;
            font-size: 13px;
          }
          .de-result-grid .row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.14);
            padding-bottom: 6px;
          }
          .de-result-grid .row.italic {
            font-style: italic;
            color: #d7f2c8;
          }
          .de-result-footer {
            margin-top: 16px;
            font-size: 12.5px;
            color: #cfe6d9;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 10px 14px;
          }
          .de-disclaimer {
            font-size: 11.5px;
            color: #8a6a3c;
            background: #fdf3e2;
            border-left: 4px solid #e8683a;
            border-radius: 10px;
            padding: 12px 16px;
            margin-top: 10px;
          }
          .de-actions {
            display: flex;
            gap: 12px;
            margin-top: 16px;
            flex-wrap: wrap;
            align-items: center;
          }
          .de-copystate {
            font-size: 12.5px;
            font-weight: 700;
            color: #3d8064;
          }
          .de-hint {
            font-size: 11px;
            color: var(--muted);
            margin-top: 8px;
            line-height: 1.6;
          }
          .de-panel details summary {
            cursor: pointer;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: #4f9d7a;
            padding: 8px 0;
          }
          .de-estimate-msg {
            font-size: 12.5px;
            color: #3d8064;
            background: #f0f9ec;
            border-radius: 10px;
            padding: 10px 12px;
            margin-top: 10px;
          }
          .de-ocr-status {
            font-size: 12px;
            color: var(--muted);
            margin-top: 8px;
          }

          @media (max-width: 720px) {
            .de-hero {
              flex-direction: column;
              align-items: flex-start;
            }
            .de-result-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div className="de-hero">
          <div className="de-hero-title">
            <span className="de-hero-eyebrow">Outil interne</span>
            <h1>Devis Express</h1>
            <p>
              Estimation instantanée par ratios moyens — sans sourcing détaillé. À envoyer en
              première réponse client ; le devis ferme se construit uniquement après accord de
              principe.
            </p>
          </div>
          <div className="de-hero-logo">
            <Image src="/images/logo-scolamove.png" alt="Scolamove" width={140} height={40} style={{ objectFit: "contain", display: "block" }} />
          </div>
        </div>

        {/* Identification */}
        <div className="admin-panel de-panel identite">
          <div className="de-panel-head">
            <div className="de-panel-icon">🗂️</div>
            <div>
              <span className="de-eyebrow">Étape 1</span>
              <h2>Identification du devis</h2>
            </div>
          </div>
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
        <div className="admin-panel de-panel voyage">
          <div className="de-panel-head">
            <div className="de-panel-icon">🚌</div>
            <div>
              <span className="de-eyebrow">Étape 2</span>
              <h2>Le voyage</h2>
            </div>
          </div>
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

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }} className="de-check-row" >
            <input type="checkbox" checked={sousTraite} onChange={(e) => setSousTraite(e.target.checked)} style={{ width: "auto" }} />
            <span>Sous-traiter le transport (autocariste tiers)</span>
          </label>
          <div className="admin-form-grid two" style={{ marginTop: 8 }}>
            <label>
              Marge transport {sousTraite ? "(sous-traité)" : "(flotte propre)"} (%)
              <input type="number" value={margeTransport} min={0} onChange={(e) => setMargeTransport(Number(e.target.value))} />
            </label>
          </div>
          <p className="de-hint">
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
        <div className="admin-panel de-panel options">
          <div className="de-panel-head">
            <div className="de-panel-icon">💶</div>
            <div>
              <span className="de-eyebrow">Étape 3</span>
              <h2>Options tarifaires (hors forfait)</h2>
            </div>
          </div>
          <label className="de-check-row">
            <input type="checkbox" checked={assuranceCheck} onChange={(e) => setAssuranceCheck(e.target.checked)} style={{ width: "auto" }} />
            <span>Ajouter l&apos;assurance annulation au devis</span>
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

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }} className="de-check-row">
            <input type="checkbox" checked={taxeSejourCheck} onChange={(e) => setTaxeSejourCheck(e.target.checked)} style={{ width: "auto" }} />
            <span>Ajouter la taxe de séjour au devis</span>
          </label>
          <label>
            Montant par nuit et par personne (€)
            <input type="number" step={0.1} value={taxeSejourMontant} onChange={(e) => setTaxeSejourMontant(Number(e.target.value))} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }} className="de-check-row">
            <input type="checkbox" checked={cautionCheck} onChange={(e) => setCautionCheck(e.target.checked)} style={{ width: "auto" }} />
            <span>Mentionner la caution hôtel (à régler sur place, non incluse au prix)</span>
          </label>
          <label>
            Montant par personne (€)
            <input type="number" value={cautionMontant} onChange={(e) => setCautionMontant(Number(e.target.value))} />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }} className="de-check-row">
            <input type="checkbox" checked={chambreIndivCheck} onChange={(e) => setChambreIndivCheck(e.target.checked)} style={{ width: "auto" }} />
            <span>Proposer la chambre individuelle pour les accompagnateurs</span>
          </label>
          <label>
            Supplément par nuit et par accompagnateur (€)
            <input type="number" value={chambreIndivMontant} onChange={(e) => setChambreIndivMontant(Number(e.target.value))} />
          </label>
        </div>

        {/* Programme + OCR */}
        <div className="admin-panel de-panel programme">
          <div className="de-panel-head">
            <div className="de-panel-icon">📋</div>
            <div>
              <span className="de-eyebrow">Optionnel</span>
              <h2>Programme du séjour</h2>
            </div>
          </div>
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
              <button type="button" onClick={estimateVisites} className="de-btn de-btn-outline">
                Estimer le budget visites
              </button>
            </div>
          </div>
          {estimateMsg && (
            <p className="de-estimate-msg">
              {estimateMsg}{" "}
              <button type="button" onClick={applyEstimate} className="de-btn de-btn-outline" style={{ marginLeft: 6 }}>
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
            {ocrStatus && <p className="de-ocr-status">{ocrStatus}</p>}
          </div>
        </div>

        {/* Résultat */}
        <div className="de-result">
          <div className="de-result-eyebrow">Prix ferme</div>
          <div className="de-result-price">
            {result.prixFerme.toFixed(0)} € <small>/ personne</small>
          </div>
          <div className="de-result-grid">
            <div className="row"><span>Transport {sousTraite ? "(sous-traité)" : "(flotte Festimove)"}</span><span>{result.transportWithMarge.toFixed(0)} €</span></div>
            <div className="row"><span>Hébergement ({nuits} nuits)</span><span>{result.hebergTotal.toFixed(0)} €</span></div>
            <div className="row"><span>Pension complète ({jours} jours)</span><span>{result.repasTotal.toFixed(0)} €</span></div>
            <div className="row"><span>Visites / activités</span><span>{result.visitesTotal.toFixed(0)} €</span></div>
            <div className="row"><span>Assistance / gestion</span><span>{result.assistTotal.toFixed(0)} €</span></div>
            {assuranceCheck && <div className="row"><span>+ Assurance annulation</span><span>{result.assuranceMontant.toFixed(2)} €</span></div>}
            {taxeSejourCheck && <div className="row"><span>+ Taxe de séjour</span><span>{result.taxeSejourTotal.toFixed(2)} €</span></div>}
            {cautionCheck && <div className="row italic"><span>Caution hôtel (non incluse)</span><span>{cautionMontant.toFixed(2)} €</span></div>}
            {chambreIndivCheck && (
              <div className="row italic"><span>+ Chambre individuelle accompagnateurs (option)</span><span>{result.chambreIndivTotalGroupe.toFixed(2)} € groupe</span></div>
            )}
          </div>
          <div className="de-result-footer">
            Groupe de {result.pax} personnes ({eleves} élèves + {accomp} accompagnateurs) → coût total
            groupe : {(result.prixFerme * result.pax).toFixed(0)} €.
          </div>
        </div>

        <p className="de-disclaimer">
          Ce prix est calculé à partir de ratios moyens et de vos marges. Il constitue une base de
          devis ferme, sous réserve de disponibilités au moment de la réservation.
        </p>

        <div className="de-actions">
          <button type="button" onClick={handleCopyEmail} className="de-btn de-btn-primary">
            Copier le texte pour l&apos;email client
          </button>
          <button type="button" onClick={handleDownload} className="de-btn de-btn-accent">
            Télécharger le devis (PDF)
          </button>
          {copyState && <span className="de-copystate">{copyState}</span>}
        </div>
      </section>
    </main>
  );
}
