"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OngletCotation } from "@/components/voyage/OngletCotation";
import { OngletDevis } from "@/components/voyage/OngletDevis";
import { OngletDossier } from "@/components/voyage/OngletDossier";
import { OngletFeuille } from "@/components/voyage/OngletFeuille";
import { OngletProgramme } from "@/components/voyage/OngletProgramme";
import { OngletReservations } from "@/components/voyage/OngletReservations";
import type { PropsOnglet } from "@/components/voyage/props";
import { avancementReservations, calculer, CATEGORIES, euros, libellePayant, prixClient } from "@/lib/voyage/calcul";
import { controlerDevis, controlerFeuilleRoute, type Onglet } from "@/lib/voyage/controle";
import { STATUTS } from "@/lib/voyage/defaults";
import { effectifTexte, periodeTexte } from "@/lib/voyage/programme";
import { enregistrerDossier, lireDossier, listerPrestataires } from "@/lib/voyage/store";
import type { Dossier, Prestataire, Statut } from "@/lib/voyage/types";

const ETAPES: { cle: Onglet; label: string }[] = [
  { cle: "dossier", label: "Dossier" },
  { cle: "programme", label: "Programme" },
  { cle: "cotation", label: "Cotation" },
  { cle: "devis", label: "Devis" },
  { cle: "reservations", label: "Réservations" },
  { cle: "feuille", label: "Feuille de route" },
];

type Sauvegarde = "a_jour" | "modifie" | "en_cours" | "erreur";

export default function PageDossier() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<Dossier | null>(null);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  // L'étape ouverte suit l'ancre de l'adresse : un rechargement y revient.
  const [onglet, setOnglet] = useState<Onglet>(() => {
    const ancre = typeof window === "undefined" ? "" : window.location.hash.replace("#", "");
    return ETAPES.some((e) => e.cle === ancre) ? (ancre as Onglet) : "dossier";
  });
  const [sauvegarde, setSauvegarde] = useState<Sauvegarde>("a_jour");
  const [heure, setHeure] = useState("");
  const [erreur, setErreur] = useState("");
  // Compteur de modifications : une sauvegarde n'est « à jour » que si rien n'a
  // changé pendant son aller-retour avec la base.
  const revision = useRef(0);

  const rechargerPrestataires = useCallback(async () => {
    try {
      setPrestataires(await listerPrestataires());
    } catch (e) {
      setErreur(e instanceof Error ? `Annuaire des prestataires : ${e.message}` : "Annuaire indisponible");
    }
  }, []);

  useEffect(() => {
    lireDossier(id)
      .then(({ dossier }) => setD(dossier))
      .catch((e) => setErreur(e instanceof Error ? e.message : "Dossier introuvable"));
    listerPrestataires()
      .then(setPrestataires)
      .catch((e) => setErreur(e instanceof Error ? `Annuaire des prestataires : ${e.message}` : "Annuaire indisponible"));
  }, [id]);

  const maj = useCallback((f: (x: Dossier) => Dossier) => {
    revision.current += 1;
    setSauvegarde("modifie");
    setD((courant) => (courant ? f(courant) : courant));
  }, []);

  const allerA = useCallback((cible: Onglet) => {
    setOnglet(cible);
    window.history.replaceState(null, "", `#${cible}`);
    window.scrollTo({ top: 0 });
  }, []);

  // Enregistrement automatique, une seconde après la dernière frappe.
  useEffect(() => {
    if (!d || sauvegarde !== "modifie") return;
    const version = revision.current;
    const minuteur = setTimeout(async () => {
      setSauvegarde("en_cours");
      try {
        await enregistrerDossier(id, d);
        setHeure(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
        setErreur("");
        setSauvegarde(revision.current === version ? "a_jour" : "modifie");
      } catch (e) {
        setErreur(e instanceof Error ? `Enregistrement impossible : ${e.message}` : "Enregistrement impossible");
        setSauvegarde("erreur");
      }
    }, 1000);
    return () => clearTimeout(minuteur);
  }, [d, id, sauvegarde]);

  // Quitter l'écran pendant le délai d'enregistrement ne doit rien perdre :
  // la dernière version part en base au démontage.
  const enAttente = useRef<Dossier | null>(null);
  useEffect(() => {
    enAttente.current = sauvegarde === "a_jour" ? null : d;
  }, [d, sauvegarde]);
  useEffect(
    () => () => {
      if (enAttente.current) void enregistrerDossier(id, enAttente.current).catch(() => {});
    },
    [id]
  );

  // Fermer l'onglet avec des modifications non enregistrées demande confirmation.
  useEffect(() => {
    const avertir = (e: BeforeUnloadEvent) => {
      if (sauvegarde !== "a_jour") e.preventDefault();
    };
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [sauvegarde]);

  const calcul = useMemo(() => (d ? calculer(d) : null), [d]);

  if (!d || !calcul) {
    return (
      <div className="vg-centre">
        <div className="vg-bloc">
          <p>{erreur || "Ouverture du dossier…"}</p>
          {erreur ? (
            <Link className="vg-btn" href="/admin/voyages">
              Retour aux dossiers
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const pointsDevis = controlerDevis(d);
  const pointsFeuille = controlerFeuilleRoute(d, prestataires);
  const reservations = avancementReservations(d);
  const repere: Partial<Record<Onglet, string>> = {
    devis: pointsDevis.length > 0 ? String(pointsDevis.length) : "",
    reservations: reservations.total > 0 ? `${reservations.confirmees}/${reservations.total}` : "",
    feuille: d.statut === "accepte" && pointsFeuille.length > 0 ? String(pointsFeuille.length) : "",
  };
  const props: PropsOnglet = { d, maj, calcul, prestataires, rechargerPrestataires, allerA };
  const diviseur = Math.max(calcul.payants, 1);
  const venteMax = Math.max(...CATEGORIES.map((c) => calcul.postes[c.cle].vente), 1);

  function changerStatut(statut: Statut) {
    maj((x) => ({
      ...x,
      statut,
      // Un devis accepté engage sur son prix : il est figé à cet instant.
      tarif: statut === "accepte" && x.tarif.prixFige === null ? { ...x.tarif, prixFige: calculer(x).prixParPayant } : x.tarif,
    }));
  }

  return (
    <>
      <div className="vg-barre">
        <Link className="vg-retour" href="/admin/voyages">
          Dossiers
        </Link>
        <div className="vg-barre-titre">
          <strong>{d.reference}</strong>
          <span>{[d.client.etablissement, d.titre || d.destination].filter(Boolean).join(", ") || "Nouveau dossier"}</span>
        </div>
        <span className={`vg-sauvegarde vg-sauvegarde-${sauvegarde}`} role="status">
          {sauvegarde === "a_jour" ? (heure ? `Enregistré à ${heure}` : "À jour") : sauvegarde === "erreur" ? "Non enregistré" : "Enregistrement…"}
        </span>
        <select className={`vg-input vg-input-auto vg-statut-dossier vg-statut-${d.statut}`} value={d.statut} aria-label="Statut du dossier" onChange={(e) => changerStatut(e.target.value as Statut)}>
          {STATUTS.map((s) => (
            <option key={s.cle} value={s.cle}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <nav className="vg-etapes-nav" aria-label="Étapes du dossier">
        {ETAPES.map((e, i) => (
          <button key={e.cle} type="button" className={e.cle === onglet ? "vg-etape-nav vg-actif" : "vg-etape-nav"} aria-current={e.cle === onglet ? "step" : undefined} onClick={() => allerA(e.cle)}>
            <span className="vg-etape-num">{i + 1}</span>
            {e.label}
            {repere[e.cle] ? <span className="vg-repere">{repere[e.cle]}</span> : null}
          </button>
        ))}
      </nav>

      {erreur ? <p className="vg-message vg-erreur vg-bandeau">{erreur}</p> : null}

      <div className="vg-corps">
        <main className="vg-principal">
          {onglet === "dossier" ? <OngletDossier {...props} /> : null}
          {onglet === "programme" ? <OngletProgramme {...props} /> : null}
          {onglet === "cotation" ? <OngletCotation {...props} /> : null}
          {onglet === "devis" ? <OngletDevis {...props} /> : null}
          {onglet === "reservations" ? <OngletReservations {...props} /> : null}
          {onglet === "feuille" ? <OngletFeuille {...props} /> : null}

          <div className="vg-suite">
            {ETAPES.findIndex((e) => e.cle === onglet) > 0 ? (
              <button type="button" className="vg-btn" onClick={() => allerA(ETAPES[ETAPES.findIndex((e) => e.cle === onglet) - 1].cle)}>
                Étape précédente
              </button>
            ) : (
              <span />
            )}
            {ETAPES.findIndex((e) => e.cle === onglet) < ETAPES.length - 1 ? (
              <button type="button" className="vg-btn vg-btn-plein" onClick={() => allerA(ETAPES[ETAPES.findIndex((e) => e.cle === onglet) + 1].cle)}>
                Étape suivante : {ETAPES[ETAPES.findIndex((e) => e.cle === onglet) + 1].label}
              </button>
            ) : null}
          </div>
        </main>

        <aside className="vg-ticket" aria-label="Prix du voyage">
          <p className="vg-ticket-label">
            Prix {libellePayant(d)}
            {d.tarif.prixFige !== null ? <span className="vg-pastille">Figé</span> : null}
          </p>
          <p className="vg-ticket-prix">{prixClient(calcul.prixParPayant)}</p>
          <p className="vg-ticket-base">
            {effectifTexte(d)}
            {calcul.payants !== calcul.participants ? `, ${calcul.payants} payants` : ""}
            <br />
            {periodeTexte(d)}
          </p>

          <dl className="vg-ticket-totaux">
            <div>
              <dt>Vente groupe</dt>
              <dd>{euros(calcul.totalVente)}</dd>
            </div>
            <div>
              <dt>Prix de revient</dt>
              <dd>{euros(calcul.revient)}</dd>
            </div>
            <div className={calcul.marge < 0 ? "vg-negatif" : "vg-positif"}>
              <dt>Marge</dt>
              <dd>
                {euros(calcul.marge)}
                <small>{calcul.totalVente > 0 ? `${calcul.margePct.toFixed(1).replace(".", ",")} % du prix` : ""}</small>
              </dd>
            </div>
          </dl>

          <ul className="vg-ticket-postes">
            {CATEGORIES.filter((c) => calcul.postes[c.cle].vente > 0).map((c) => (
              <li key={c.cle}>
                <span>{c.court}</span>
                <span className="vg-barre-poste">
                  <span style={{ width: `${(calcul.postes[c.cle].vente / venteMax) * 100}%` }} />
                </span>
                <strong>{euros(calcul.postes[c.cle].vente / diviseur)}</strong>
              </li>
            ))}
          </ul>

          {calcul.options.length > 0 ? (
            <p className="vg-ticket-options">
              {calcul.options.map((o) => (
                <span key={o.id}>
                  Option {o.libelle} : + {euros(o.parPayant)}
                </span>
              ))}
            </p>
          ) : null}
        </aside>
      </div>
    </>
  );
}
