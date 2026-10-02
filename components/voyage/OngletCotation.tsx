"use client";

import { useState } from "react";
import { ajouterPrestations, deplacerPrestation, majPrestation, supprimerPrestation } from "@/lib/voyage/actions";
import { CATEGORIES, euros, margeLigne } from "@/lib/voyage/calcul";
import { MODELES, nouvellePrestation, preChiffrer, ZONES } from "@/lib/voyage/defaults";
import type { Categorie, ModePrix, Prestation, Tarif } from "@/lib/voyage/types";
import { Bloc, Champ, Nombre, Texte } from "./champs";
import type { PropsOnglet } from "./props";

// Marge d'une ligne : vide = marge du dossier, 0 = refacturé à prix coûtant.
function ChampMarge({ value, defaut, onChange }: { value: number | null; defaut: number; onChange: (v: number | null) => void }) {
  const [saisie, setSaisie] = useState<string | null>(null);
  return (
    <span className="vg-nombre">
      <input
        className="vg-input"
        inputMode="decimal"
        aria-label="Marge de la ligne"
        title="Marge de la ligne. Vide : marge du dossier."
        placeholder={String(defaut).replace(".", ",")}
        value={saisie ?? (value === null ? "" : String(value).replace(".", ","))}
        onFocus={(e) => {
          const el = e.currentTarget;
          setSaisie(value === null ? "" : String(value).replace(".", ","));
          setTimeout(() => el.select(), 0);
        }}
        onChange={(e) => {
          setSaisie(e.target.value);
          const propre = e.target.value.trim().replace(",", ".");
          if (propre === "") onChange(null);
          else if (Number.isFinite(Number(propre))) onChange(Number(propre));
        }}
        onBlur={() => setSaisie(null)}
      />
      <span className="vg-suffixe">%</span>
    </span>
  );
}

export function OngletCotation({ d, maj, calcul }: PropsOnglet) {
  const [confort, setConfort] = useState(1);
  const [flottePropre, setFlottePropre] = useState(true);
  const tarif = (patch: Partial<Tarif>) => maj((x) => ({ ...x, tarif: { ...x.tarif, ...patch } }));
  const ligne = (id: string, patch: Partial<Prestation>) => maj((x) => majPrestation(x, id, patch));
  const fige = d.tarif.prixFige !== null;

  function poserEstimation() {
    if (!d.zone) return;
    if (d.prestations.length > 0 && !window.confirm("Ajouter les lignes estimées à la cotation existante ?")) return;
    maj((x) => ajouterPrestations(x, preChiffrer(x, x.zone, confort, flottePropre)));
  }

  return (
    <>
      <Bloc titre="Règles de prix">
        <div className="vg-grille vg-grille-6">
          <Champ label="Marge par défaut" aide="Appliquée sur le prix de revient.">
            <Nombre value={d.tarif.marge} onChange={(marge) => tarif({ marge })} suffixe="%" />
          </Champ>
          <Champ label="Gratuités adultes" aide={`${calcul.payants} payant${calcul.payants > 1 ? "s" : ""} sur ${calcul.participants}.`}>
            <Nombre value={d.tarif.gratuites} onChange={(gratuites) => tarif({ gratuites: Math.min(Math.max(Math.round(gratuites), 0), d.accompagnateurs) })} />
          </Champ>
          <Champ label="Arrondi du prix">
            <select className="vg-input" value={d.tarif.arrondi} onChange={(e) => tarif({ arrondi: Number(e.target.value) as Tarif["arrondi"] })}>
              <option value={0}>Au centime</option>
              <option value={1}>À l&apos;euro supérieur</option>
              <option value={5}>Aux 5 € supérieurs</option>
            </select>
          </Champ>
          <div className="vg-champ vg-champ-large">
            <span className="vg-label">Prix figé</span>
            <span className="vg-ligne">
              <label className="vg-coche">
                <input type="checkbox" checked={fige} onChange={(e) => tarif({ prixFige: e.target.checked ? calcul.prixParPayant : null })} />
                Devis accepté
              </label>
              {fige ? <Nombre value={d.tarif.prixFige || 0} onChange={(prixFige) => tarif({ prixFige })} suffixe="€ / pers." /> : null}
            </span>
            <span className="vg-aide">
              {fige
                ? `Le client paie ce prix. La cotation donne ${euros(calcul.prixCalcule)} : l'écart va à la marge.`
                : "À cocher une fois le devis signé : les coûts pourront bouger sans changer le prix client."}
            </span>
          </div>
        </div>

        <details className="vg-estimation">
          <summary>Pré-chiffrer par ratios de zone</summary>
          <div className="vg-ligne">
            <span>{d.zone ? ZONES[d.zone]?.label : "Choisis la zone tarifaire dans l'étape Dossier."}</span>
            <select className="vg-input vg-input-auto" value={confort} onChange={(e) => setConfort(Number(e.target.value))} aria-label="Niveau de confort">
              <option value={0.85}>Économique</option>
              <option value={1}>Standard</option>
              <option value={1.25}>Confort</option>
            </select>
            <label className="vg-coche">
              <input type="checkbox" checked={flottePropre} onChange={(e) => setFlottePropre(e.target.checked)} />
              Autocar Festimove
            </label>
            <button type="button" className="vg-btn" disabled={!d.zone} onClick={poserEstimation}>
              Poser les lignes estimées
            </button>
          </div>
          <p className="vg-aide">Donne un ordre de prix en quelques secondes. Remplace ensuite chaque ligne par le tarif réel du prestataire.</p>
        </details>
      </Bloc>

      {CATEGORIES.map((categorie) => {
        const lignes = d.prestations.filter((p) => p.categorie === categorie.cle);
        const poste = calcul.postes[categorie.cle];
        return (
          <section key={categorie.cle} className="vg-bloc vg-poste">
            <div className="vg-bloc-tete">
              <h2>{categorie.label}</h2>
              <span className="vg-poste-total">
                {lignes.length > 0 ? (
                  <>
                    Revient <strong>{euros(poste.revient)}</strong>, vente <strong>{euros(poste.vente)}</strong>
                  </>
                ) : (
                  "Aucune ligne"
                )}
              </span>
            </div>

            {lignes.length > 0 ? (
              <div className="vg-cotation">
                <div className="vg-cot-tete">
                  <span>Prestation</span>
                  <span>Calcul</span>
                  <span>Quantité</span>
                  <span>Prix d&apos;achat</span>
                  <span>Marge</span>
                  <span className="vg-droite">Revient</span>
                  <span className="vg-droite">Vente</span>
                  <span className="vg-droite">Par payant</span>
                  <span />
                </div>
                {lignes.map((p, index) => {
                  const c = calcul.lignes[p.id];
                  const jour = d.programme.findIndex((j) => j.id === p.jourId);
                  return (
                    <div key={p.id} className={p.enOption ? "vg-cot-ligne vg-cot-option" : "vg-cot-ligne"}>
                      <Texte value={p.libelle} titre={p.libelle} placeholder="Libellé de la prestation" onChange={(libelle) => ligne(p.id, { libelle })} />
                      <select className="vg-input" value={p.mode} aria-label="Mode de calcul" onChange={(e) => ligne(p.id, { mode: e.target.value as ModePrix })}>
                        <option value="personne">Par pers.</option>
                        <option value="groupe">Forfait</option>
                        <option value="pourcent">% du prix</option>
                      </select>
                      {p.mode === "pourcent" ? (
                        <span className="vg-muet">Du prix par payant</span>
                      ) : (
                        <span className="vg-duo">
                          <Nombre value={p.quantite} titre="Quantité" onChange={(quantite) => ligne(p.id, { quantite })} />
                          <Texte value={p.unite} placeholder="unité" titre="Unité" onChange={(unite) => ligne(p.id, { unite })} />
                        </span>
                      )}
                      {p.mode === "personne" ? (
                        <span className="vg-duo">
                          <Nombre value={p.prixEleve} titre="Prix d'achat par élève" suffixe="élève" onChange={(prixEleve) => ligne(p.id, { prixEleve })} />
                          <Nombre value={p.prixAdulte} titre="Prix d'achat par adulte" suffixe="adulte" onChange={(prixAdulte) => ligne(p.id, { prixAdulte })} />
                        </span>
                      ) : p.mode === "groupe" ? (
                        <Nombre value={p.prixGroupe} titre="Prix d'achat unitaire" suffixe="€ / unité" onChange={(prixGroupe) => ligne(p.id, { prixGroupe })} />
                      ) : (
                        <span className="vg-duo">
                          <Nombre value={p.taux} titre="Taux" suffixe="%" onChange={(taux) => ligne(p.id, { taux })} />
                          <Nombre value={p.minimum} titre="Minimum par personne" suffixe="mini" onChange={(minimum) => ligne(p.id, { minimum })} />
                        </span>
                      )}
                      {p.mode === "pourcent" ? (
                        <span className="vg-muet">Sans marge</span>
                      ) : (
                        <ChampMarge value={p.marge} defaut={d.tarif.marge} onChange={(marge) => ligne(p.id, { marge })} />
                      )}
                      <span className="vg-droite vg-chiffre">{euros(c?.revient || 0)}</span>
                      <span className="vg-droite vg-chiffre" title={`Marge appliquée : ${margeLigne(p, d)} %`}>
                        {euros(c?.vente || 0)}
                      </span>
                      <span className="vg-droite vg-chiffre vg-fort">{euros(c?.parPayant || 0)}</span>
                      <span className="vg-outils">
                        <button type="button" className="vg-icone" title="Monter" disabled={index === 0} onClick={() => maj((x) => deplacerPrestation(x, p.id, -1))}>
                          ↑
                        </button>
                        <button type="button" className="vg-icone" title="Descendre" disabled={index === lignes.length - 1} onClick={() => maj((x) => deplacerPrestation(x, p.id, 1))}>
                          ↓
                        </button>
                        <button type="button" className="vg-icone vg-danger" title="Supprimer la ligne" onClick={() => maj((x) => supprimerPrestation(x, p.id))}>
                          ×
                        </button>
                      </span>
                      <span className="vg-cot-reglages">
                        {jour >= 0 ? <span className="vg-pastille">Jour {jour + 1} du programme</span> : null}
                        <label className="vg-coche">
                          <input type="checkbox" checked={p.enOption} onChange={(e) => ligne(p.id, { enOption: e.target.checked })} />
                          En option, hors prix
                        </label>
                        {p.mode === "personne" && d.conducteurs > 0 ? (
                          <label className="vg-coche">
                            <input type="checkbox" checked={p.conducteurs} onChange={(e) => ligne(p.id, { conducteurs: e.target.checked })} />
                            Compter les {d.conducteurs > 1 ? `${d.conducteurs} conducteurs` : "le conducteur"} au tarif adulte
                          </label>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="vg-ajouts">
              {MODELES[categorie.cle].map((modele) => (
                <button key={modele.label} type="button" className="vg-btn vg-btn-mini" onClick={() => maj((x) => ajouterPrestations(x, modele.creer(x)))}>
                  + {modele.label}
                </button>
              ))}
              <button type="button" className="vg-btn vg-btn-mini vg-btn-discret" onClick={() => maj((x) => ajouterPrestations(x, [nouvellePrestation(categorie.cle as Categorie)]))}>
                + Ligne libre
              </button>
            </div>
          </section>
        );
      })}
    </>
  );
}
