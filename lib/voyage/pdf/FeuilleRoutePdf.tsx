import { Document, Page, Text, View } from "@react-pdf/renderer";
import { AGENCE } from "../agence";
import { duree } from "../calcul";
import { STATUTS_RESERVATION } from "../defaults";
import { dateDuJour, effectifTexte, formatDate, formatJour, periodeTexte, synoptique } from "../programme";
import type { Dossier, Prestataire } from "../types";
import { C, Entete, Fiche, Paragraphes, Pied, Puces, s } from "./commun";

const COLONNES_SYNOPTIQUE: { cle: "matin" | "dejeuner" | "apresMidi" | "diner"; titre: string }[] = [
  { cle: "matin", titre: "Matin" },
  { cle: "dejeuner", titre: "Déjeuner" },
  { cle: "apresMidi", titre: "Après-midi" },
  { cle: "diner", titre: "Dîner et soirée" },
];

export function FeuilleRoutePdf({
  dossier: d,
  prestataires,
  logo,
  date = new Date(),
}: {
  dossier: Dossier;
  prestataires: Prestataire[];
  logo: string;
  date?: Date;
}) {
  const f = d.feuilleRoute;
  const { nuits } = duree(d);
  const adresse = [d.client.adresse, [d.client.codePostal, d.client.ville].filter(Boolean).join(" ")].filter(Boolean);
  const annuaire = new Map(prestataires.map((p) => [p.id, p]));
  const lignes = synoptique(d);
  const conducteurs = f.conducteurs.filter((c) => c.nom.trim());

  // Prestataires réellement utilisés par ce dossier, avec leurs prestations.
  const utilises = prestataires
    .map((p) => ({
      prestataire: p,
      prestations: d.prestations.filter((x) => x.prestataireId === p.id && !x.enOption),
    }))
    .filter((x) => x.prestations.length > 0);

  const parNom = (a: { nom: string; prenom: string }, b: { nom: string; prenom: string }) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr");
  const eleves = d.participants.filter((p) => p.role === "eleve").sort(parNom);
  const adultes = d.participants.filter((p) => p.role === "accompagnateur").sort(parNom);
  const sansChambre = d.participants.filter((p) => !p.chambreId || !d.chambres.some((c) => c.id === p.chambreId)).sort(parNom);
  const nomComplet = (p: { nom: string; prenom: string }) => `${p.nom.toUpperCase()} ${p.prenom}`.trim();

  return (
    <Document title={`Feuille de route ${d.reference}`} author={AGENCE.nom}>
      {/* 1. Lettre */}
      <Page size="A4" style={s.page}>
        <Entete logo={logo} titre="Feuille de route" reference={d.reference} />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 22 }}>
          <View style={{ width: "50%" }}>
            <Text style={s.gras}>{d.client.etablissement}</Text>
            {d.client.enseignant ? <Text>À l&apos;attention de {d.client.enseignant}</Text> : null}
            {adresse.map((l) => (
              <Text key={l}>{l}</Text>
            ))}
            <Text style={[s.petit, { marginTop: 8 }]}>Le {formatDate(date.toISOString().slice(0, 10))}</Text>
          </View>
        </View>

        <Text style={[s.gras, { marginBottom: 12 }]}>
          Objet : feuille de route, {d.titre || d.destination}, {periodeTexte(d)}
        </Text>

        <Paragraphes texte={f.lettre} taille={10.5} />

        <View style={{ marginTop: 14 }}>
          <Text style={s.gras}>{d.suiviPar || AGENCE.signataire}</Text>
          <Text>{AGENCE.nom}</Text>
        </View>

        <View style={{ marginTop: 26, borderWidth: 1.5, borderColor: C.orange, borderRadius: 4, padding: 12 }} wrap={false}>
          <Text style={{ fontFamily: "Helvetica-Bold", color: C.orange, fontSize: 10 }}>En cas d&apos;urgence pendant le voyage</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 16, marginTop: 4 }}>{f.urgenceTelephone || "Numéro à renseigner"}</Text>
          <Text style={s.petit}>{f.urgenceNom}, joignable 24 h/24 pendant toute la durée du séjour</Text>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={s.petit}>Dans ce document</Text>
          <Puces
            texte={[
              "Le tableau synoptique du séjour",
              "Les informations générales : départ, retour, autocar, formalités",
              "Le programme jour par jour",
              utilises.length > 0 ? "Les coordonnées de vos prestataires" : "",
              d.participants.length > 0 ? "Les chambres et la liste des participants" : "",
            ]
              .filter(Boolean)
              .join("\n")}
          />
        </View>
        <Pied />
      </Page>

      {/* 2. Tableau synoptique */}
      {lignes.length > 0 ? (
        <Page size="A4" orientation="landscape" style={s.page}>
          <Entete logo={logo} titre="Tableau synoptique" reference={d.reference} />
          <View style={s.table}>
            <View style={s.teteLigne}>
              <Text style={[s.tete, { width: 78 }]}>Jour</Text>
              {COLONNES_SYNOPTIQUE.map((c) => (
                <Text key={c.cle} style={[s.tete, { flex: 1 }]}>
                  {c.titre}
                </Text>
              ))}
              <Text style={[s.tete, { width: 120 }]}>Nuit</Text>
            </View>
            {lignes.map((l, i) => (
              <View key={i} style={[s.ligne, i % 2 === 1 ? { backgroundColor: C.fond } : {}]} wrap={false}>
                <View style={[s.cell, { width: 78 }]}>
                  <Text style={s.gras}>{l.jour}</Text>
                  <Text style={s.petit}>{l.date}</Text>
                </View>
                {COLONNES_SYNOPTIQUE.map((c) => (
                  <View key={c.cle} style={[s.cell, { flex: 1, borderLeftWidth: 1, borderLeftColor: C.trait }]}>
                    {l[c.cle].map((texte, k) => (
                      <Text key={k} style={{ fontSize: 8.5, marginBottom: 1.5 }}>
                        {texte}
                      </Text>
                    ))}
                  </View>
                ))}
                <Text style={[s.cell, { width: 120, fontSize: 8.5, borderLeftWidth: 1, borderLeftColor: C.trait }]}>{l.nuit}</Text>
              </View>
            ))}
          </View>
          <Pied />
        </Page>
      ) : null}

      {/* 3. Informations générales */}
      <Page size="A4" style={s.page}>
        <Entete logo={logo} titre="Informations générales" reference={d.reference} />

        <Fiche
          lignes={[
            ["Séjour", d.titre || d.destination],
            ["Dates", periodeTexte(d)],
            ["Groupe", `${d.client.etablissement}${d.client.classe ? `, ${d.client.classe}` : ""}`],
            ["Effectif", effectifTexte(d)],
            ["Responsable", [d.client.enseignant, d.client.telephone].filter(Boolean).join(", ")],
          ]}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }} wrap={false}>
          <View style={{ width: "49%", borderWidth: 1, borderColor: C.trait, borderRadius: 3, padding: 9 }}>
            <Text style={[s.h3, { color: C.vertFonce }]}>Départ, {formatJour(dateDuJour(d, 0), true) || "date à préciser"}</Text>
            <Text style={s.gras}>{f.departLieu}</Text>
            {f.departAdresse ? <Text>{f.departAdresse}</Text> : null}
            <Text style={{ marginTop: 4 }}>
              Convocation : <Text style={s.gras}>{f.convocation || "à préciser"}</Text>
            </Text>
            <Text>
              Départ de l&apos;autocar : <Text style={s.gras}>{f.departHeure || "à préciser"}</Text>
            </Text>
          </View>
          <View style={{ width: "49%", borderWidth: 1, borderColor: C.trait, borderRadius: 3, padding: 9 }}>
            <Text style={[s.h3, { color: C.vertFonce }]}>
              Retour, {formatJour(dateDuJour(d, nuits), true) || "date à préciser"}
            </Text>
            <Text style={s.gras}>{f.retourLieu || f.departLieu}</Text>
            <Text style={{ marginTop: 4 }}>
              Arrivée prévue : <Text style={s.gras}>{f.retourHeure || "à préciser"}</Text>
            </Text>
            <Text style={s.petit}>Horaire donné à titre indicatif, selon les conditions de circulation.</Text>
          </View>
        </View>

        <Text style={s.h2}>Votre autocar</Text>
        <Fiche
          lignes={[
            ["Transporteur", f.transporteur],
            ["Véhicule", [f.vehicule, f.immatriculation].filter(Boolean).join(", ")],
            [
              conducteurs.length > 1 ? "Conducteurs" : "Conducteur",
              conducteurs.map((c) => [c.nom, c.telephone].filter(Boolean).join(", ")).join("\n"),
            ],
          ]}
        />

        {f.formalites.trim() ? (
          <View>
            <Text style={s.h2}>Formalités</Text>
            <Puces texte={f.formalites} />
          </View>
        ) : null}
        {f.consignes.trim() ? (
          <View>
            <Text style={s.h2}>Consignes pratiques</Text>
            <Puces texte={f.consignes} />
          </View>
        ) : null}

        <Pied />
      </Page>

      {/* 4. Programme jour par jour : une journée n'est jamais coupée entre deux pages */}
      <Page size="A4" style={s.page}>
        <Entete logo={logo} titre="Programme jour par jour" reference={d.reference} />
        {d.programme.map((jour, index) => (
          <View key={jour.id} style={{ marginBottom: 12 }} wrap={false}>
            <View style={{ flexDirection: "row", backgroundColor: C.vertFonce, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 2 }}>
              <Text style={{ color: C.blanc, fontFamily: "Helvetica-Bold", fontSize: 10, flex: 1 }}>
                Jour {index + 1}
                {jour.titre ? `, ${jour.titre}` : ""}
              </Text>
              <Text style={{ color: C.blanc, fontSize: 9 }}>{formatJour(dateDuJour(d, index), true)}</Text>
            </View>
            {jour.etapes.filter((e) => e.libelle.trim()).length === 0 && jour.resume.trim() ? (
              <View style={{ padding: 6 }}>
                <Paragraphes texte={jour.resume} />
              </View>
            ) : null}
            {jour.etapes
              .filter((e) => e.libelle.trim())
              .map((e) => {
                const prestation = d.prestations.find((p) => p.id === e.prestationId);
                const prestataire = prestation?.prestataireId ? annuaire.get(prestation.prestataireId) : undefined;
                return (
                  <View key={e.id} style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.trait, paddingVertical: 4 }}>
                    <Text style={{ width: 46, fontFamily: "Helvetica-Bold", color: C.orange }}>{e.heure}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.gras}>{e.libelle}</Text>
                      {e.lieu ? <Text>{e.lieu}</Text> : null}
                      {e.detail ? <Text style={{ color: C.gris }}>{e.detail}</Text> : null}
                      {prestataire || prestation?.refReservation ? (
                        <Text style={s.petit}>
                          {[
                            prestataire ? [prestataire.nom, prestataire.telephone].filter(Boolean).join(", ") : "",
                            prestation?.refReservation ? `réservation ${prestation.refReservation}` : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            {jour.nuit.trim() ? (
              <Text style={{ marginTop: 3, fontSize: 9 }}>
                <Text style={s.gras}>Nuit : </Text>
                {jour.nuit}
              </Text>
            ) : null}
          </View>
        ))}
        <Pied />
      </Page>

      {/* 5. Prestataires */}
      {utilises.length > 0 ? (
        <Page size="A4" style={s.page}>
          <Entete logo={logo} titre="Vos prestataires" reference={d.reference} />
          {utilises.map(({ prestataire: p, prestations }) => (
            <View key={p.id} style={{ borderWidth: 1, borderColor: C.trait, borderRadius: 3, marginBottom: 8 }} wrap={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: C.fond, padding: 7 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>{p.nom}</Text>
                <Text style={s.petit}>{p.type}</Text>
              </View>
              <View style={{ flexDirection: "row", padding: 7 }}>
                <View style={{ width: "50%", paddingRight: 8 }}>
                  {p.adresse ? <Text>{p.adresse}</Text> : null}
                  <Text>{[p.code_postal, p.ville, p.pays].filter(Boolean).join(" ")}</Text>
                  {p.telephone ? <Text style={s.gras}>{p.telephone}</Text> : null}
                  {p.email ? <Text>{p.email}</Text> : null}
                  {p.contact ? <Text style={s.petit}>Contact : {p.contact}</Text> : null}
                </View>
                <View style={{ width: "50%" }}>
                  {prestations.map((x) => {
                    const jour = d.programme.findIndex((j) => j.id === x.jourId);
                    const statut = STATUTS_RESERVATION.find((st) => st.cle === x.statut)?.label || "";
                    return (
                      <View key={x.id} style={{ marginBottom: 3 }}>
                        <Text>
                          {x.libelle}
                          {jour >= 0 ? ` (jour ${jour + 1})` : ""}
                        </Text>
                        <Text style={s.petit}>
                          {[statut, x.refReservation ? `réservation ${x.refReservation}` : ""].filter(Boolean).join(" · ")}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          ))}
          <Pied />
        </Page>
      ) : null}

      {/* 6. Chambres et participants */}
      {d.participants.length > 0 ? (
        <Page size="A4" style={s.page}>
          <Entete logo={logo} titre="Chambres et participants" reference={d.reference} />
          <Text style={{ marginBottom: 8 }}>
            {eleves.length} élève{eleves.length > 1 ? "s" : ""} et {adultes.length} accompagnateur{adultes.length > 1 ? "s" : ""}
            {d.chambres.length > 0 ? `, répartis en ${d.chambres.length} chambre${d.chambres.length > 1 ? "s" : ""}` : ""}.
          </Text>

          {d.chambres.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 }}>
              {d.chambres.map((c) => {
                const occupants = d.participants.filter((p) => p.chambreId === c.id).sort(parNom);
                return (
                  <View key={c.id} style={{ width: "33.33%", padding: 3 }} wrap={false}>
                    <View style={{ borderWidth: 1, borderColor: C.trait, borderRadius: 3, minHeight: 62 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: C.vertClair, paddingVertical: 3, paddingHorizontal: 6 }}>
                        <Text style={[s.gras, { fontSize: 9 }]}>{c.nom}</Text>
                        <Text style={s.petit}>
                          {occupants.length} / {c.capacite}
                        </Text>
                      </View>
                      <View style={{ padding: 6 }}>
                        {occupants.map((p) => (
                          <Text key={p.id} style={{ fontSize: 8.5 }}>
                            {nomComplet(p)}
                            {p.role === "accompagnateur" ? " (acc.)" : ""}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {sansChambre.length > 0 && d.chambres.length > 0 ? (
            <Text style={[s.petit, { marginTop: 6 }]}>Sans chambre attribuée : {sansChambre.map(nomComplet).join(", ")}</Text>
          ) : null}

          <Text style={s.h2}>Liste des participants</Text>
          <View style={s.table}>
            <View style={s.teteLigne}>
              <Text style={[s.tete, { width: 26 }]}>N°</Text>
              <Text style={[s.tete, { flex: 1 }]}>Nom et prénom</Text>
              <Text style={[s.tete, { width: 70 }]}>Classe</Text>
              <Text style={[s.tete, { width: 80 }]}>Chambre</Text>
              <Text style={[s.tete, { width: 150 }]}>Remarque</Text>
            </View>
            {[...adultes, ...eleves].map((p, i) => (
              <View key={p.id} style={s.ligne} wrap={false}>
                <Text style={[s.cell, { width: 26, color: C.gris }]}>{i + 1}</Text>
                <Text style={[s.cell, { flex: 1 }]}>
                  {nomComplet(p)}
                  {p.role === "accompagnateur" ? " (accompagnateur)" : ""}
                </Text>
                <Text style={[s.cell, { width: 70 }]}>{p.classe}</Text>
                <Text style={[s.cell, { width: 80 }]}>{d.chambres.find((c) => c.id === p.chambreId)?.nom || ""}</Text>
                <Text style={[s.cell, { width: 150 }]}>{p.remarque}</Text>
              </View>
            ))}
          </View>
          <Pied />
        </Page>
      ) : null}
    </Document>
  );
}
