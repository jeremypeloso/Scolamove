"use client";

import { duree } from "@/lib/voyage/calcul";
import { vehiculeConseille, ZONES } from "@/lib/voyage/defaults";
import { periodeTexte } from "@/lib/voyage/programme";
import type { Client, Dossier } from "@/lib/voyage/types";
import { Bloc, Champ, Nombre, Texte } from "./champs";
import type { PropsOnglet } from "./props";

export function OngletDossier({ d, maj }: PropsOnglet) {
  const client = (patch: Partial<Client>) => maj((x) => ({ ...x, client: { ...x.client, ...patch } }));
  const champ = (patch: Partial<Dossier>) => maj((x) => ({ ...x, ...patch }));
  const { jours, nuits } = duree(d);
  const datesConnues = Boolean(d.depart && d.retour);
  const personnes = d.eleves + d.accompagnateurs + d.conducteurs;
  const places = vehiculeConseille(personnes);

  return (
    <>
      <Bloc titre="Le voyage">
        <div className="vg-grille">
          <Champ label="Intitulé du voyage" large>
            <Texte value={d.titre} onChange={(titre) => champ({ titre })} placeholder="Séjour Italie, Toscane et Vénétie" />
          </Champ>
          <Champ label="Destination" large>
            <Texte value={d.destination} onChange={(destination) => champ({ destination })} placeholder="Florence, Venise, Vérone" />
          </Champ>
          <Champ label="Zone tarifaire" aide="Sert au pré-chiffrage par ratios.">
            <select className="vg-input" value={d.zone} onChange={(e) => champ({ zone: e.target.value })}>
              <option value="">Non définie</option>
              {Object.entries(ZONES).map(([cle, z]) => (
                <option key={cle} value={cle}>
                  {z.label}
                </option>
              ))}
            </select>
          </Champ>
          <Champ label="Dossier suivi par">
            <Texte value={d.suiviPar} onChange={(suiviPar) => champ({ suiviPar })} />
          </Champ>
        </div>
      </Bloc>

      <Bloc titre="Dates et effectif" note={periodeTexte(d)}>
        <div className="vg-grille vg-grille-6">
          <Champ label="Départ">
            <Texte type="date" value={d.depart} onChange={(depart) => champ({ depart })} />
          </Champ>
          <Champ label="Retour">
            <Texte type="date" value={d.retour} onChange={(retour) => champ({ retour })} />
          </Champ>
          <Champ label="Jours" aide={datesConnues ? "Calculé" : undefined}>
            <Nombre value={jours} onChange={(x) => champ({ jours: x })} desactive={datesConnues} />
          </Champ>
          <Champ label="Nuits" aide={datesConnues ? "Calculé" : undefined}>
            <Nombre value={nuits} onChange={(x) => champ({ nuits: x })} desactive={datesConnues} />
          </Champ>
          {!datesConnues ? (
            <Champ label="Période souhaitée" large aide="Affichée sur le devis tant que les dates ne sont pas fixées.">
              <Texte value={d.periode} onChange={(periode) => champ({ periode })} placeholder="Avril 2027" />
            </Champ>
          ) : null}
        </div>
        <div className="vg-grille vg-grille-6">
          <Champ label="Élèves">
            <Nombre value={d.eleves} onChange={(eleves) => champ({ eleves })} />
          </Champ>
          <Champ label="Accompagnateurs">
            <Nombre value={d.accompagnateurs} onChange={(accompagnateurs) => champ({ accompagnateurs })} />
          </Champ>
          <Champ label="Conducteurs">
            <Nombre value={d.conducteurs} onChange={(conducteurs) => champ({ conducteurs })} />
          </Champ>
          <div className="vg-champ vg-champ-large">
            <span className="vg-label">Autocar</span>
            <p className="vg-lecture">
              {personnes === d.conducteurs
                ? "Renseigne l'effectif pour connaître le véhicule adapté."
                : places
                  ? `${personnes} personnes à bord : autocar de ${places} places de la flotte Festimove.`
                  : `${personnes} personnes à bord : au-delà de 98 places, prévoir deux autocars.`}
            </p>
          </div>
        </div>
      </Bloc>

      <Bloc titre="Le client">
        <div className="vg-grille">
          <Champ label="Établissement" large>
            <Texte value={d.client.etablissement} onChange={(etablissement) => client({ etablissement })} placeholder="Collège Marcel Pagnol" />
          </Champ>
          <Champ label="Classes concernées">
            <Texte value={d.client.classe} onChange={(classe) => client({ classe })} placeholder="Classes de 4e" />
          </Champ>
          <Champ label="Adresse" large>
            <Texte value={d.client.adresse} onChange={(adresse) => client({ adresse })} />
          </Champ>
          <Champ label="Code postal">
            <Texte value={d.client.codePostal} onChange={(codePostal) => client({ codePostal })} />
          </Champ>
          <Champ label="Ville">
            <Texte value={d.client.ville} onChange={(ville) => client({ ville })} />
          </Champ>
          <Champ label="Enseignant responsable" large>
            <Texte value={d.client.enseignant} onChange={(enseignant) => client({ enseignant })} placeholder="Mme Durand" />
          </Champ>
          <Champ label="Email" aide="Ouvre l'espace enseignant à la publication.">
            <Texte type="email" value={d.client.email} onChange={(email) => client({ email })} />
          </Champ>
          <Champ label="Téléphone" aide="Repris sur la feuille de route.">
            <Texte type="tel" value={d.client.telephone} onChange={(telephone) => client({ telephone })} />
          </Champ>
        </div>
      </Bloc>
    </>
  );
}
