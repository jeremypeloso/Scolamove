import { Document, Page, Text, View } from "@react-pdf/renderer";
import { AGENCE } from "../agence";
import { CATEGORIES, libellePayant, prixClient, type Calcul } from "../calcul";
import { nuitsHebergement } from "../defaults";
import { dateDuJour, effectifTexte, formatDate, formatJour, periodeTexte } from "../programme";
import type { Dossier } from "../types";
import { PagesCgv } from "./CgvPdf";
import { C, Entete, Fiche, Paragraphes, Pied, Puces, s } from "./commun";

function dateFr(date: Date): string {
  return formatDate(date.toISOString().slice(0, 10));
}

export function DevisPdf({
  dossier: d,
  calcul,
  logo,
  cgv = "",
  date = new Date(),
}: {
  dossier: Dossier;
  calcul: Calcul;
  logo: string;
  // Texte des conditions de vente ; vide : le devis part sans.
  cgv?: string;
  date?: Date;
}) {
  const avecCgv = d.tarif.joindreCgv && cgv.trim().length > 0;
  const version = d.versions.length + 1;
  const validite = new Date(date.getTime() + d.tarif.validiteJours * 86400000);
  const nuits = nuitsHebergement(d);
  const gratuites = Math.min(d.tarif.gratuites, d.accompagnateurs);
  const hebergement = d.prestations.find((p) => p.categorie === "hebergement" && !p.enOption);
  const transport = d.prestations.some((p) => p.categorie === "transport" && !p.enOption);
  const adresse = [d.client.adresse, [d.client.codePostal, d.client.ville].filter(Boolean).join(" ")].filter(Boolean);
  const postes = CATEGORIES.filter((c) => calcul.postes[c.cle].vente > 0);
  const diviseur = Math.max(calcul.payants, 1);
  const visites = d.prestations.filter((p) => p.categorie === "visites" && !p.enOption && p.libelle.trim());
  const qui = libellePayant(d);

  return (
    <Document title={`Devis ${d.reference}`} author={AGENCE.nom}>
      <Page size="A4" style={s.page}>
        <Entete logo={logo} titre="Devis" reference={`${d.reference}${version > 1 ? `, version ${version}` : ""}`} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
          <View style={{ width: "48%" }}>
            <Text style={s.petit}>Votre interlocuteur</Text>
            <Text style={s.gras}>{d.suiviPar || AGENCE.signataire}</Text>
            <Text>{AGENCE.nom}</Text>
            {AGENCE.telephone ? <Text>{AGENCE.telephone}</Text> : null}
            <Text>{AGENCE.email}</Text>
          </View>
          <View style={{ width: "48%", backgroundColor: C.fond, padding: 10, borderRadius: 3 }}>
            <Text style={s.gras}>{d.client.etablissement || "Établissement scolaire"}</Text>
            {d.client.enseignant ? <Text>À l&apos;attention de {d.client.enseignant}</Text> : null}
            {adresse.map((l) => (
              <Text key={l}>{l}</Text>
            ))}
          </View>
        </View>

        <Text style={[s.petit, { marginBottom: 10 }]}>
          Établi le {dateFr(date)}, valable jusqu&apos;au {dateFr(validite)}
        </Text>

        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 15, marginBottom: 6 }}>
          {d.titre || d.destination || "Voyage scolaire"}
        </Text>
        <Paragraphes texte={`Bonjour${d.client.enseignant ? ` ${d.client.enseignant}` : ""},\n${d.textes.intro}`} />

        <View style={{ marginTop: 6 }}>
          <Fiche
            lignes={[
              ["Destination", d.destination],
              ["Période", periodeTexte(d)],
              ["Effectif", `${effectifTexte(d)}${d.client.classe ? ` (${d.client.classe})` : ""}`],
              ["Transport", transport ? "Autocar grand tourisme au départ de votre établissement" : ""],
              ["Hébergement", hebergement ? `${hebergement.libelle}, ${nuits} nuit${nuits > 1 ? "s" : ""}` : ""],
            ]}
          />
        </View>

        <View style={{ marginTop: 16, borderWidth: 1.5, borderColor: C.vert, borderRadius: 4 }} wrap={false}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: C.vertClair }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, color: C.vertFonce }}>Prix du voyage {qui}</Text>
              <Text style={[s.petit, { marginTop: 2 }]}>
                Base : {effectifTexte(d)}
                {gratuites > 0 ? `, dont ${gratuites} gratuité${gratuites > 1 ? "s" : ""} accompagnateur` : ""}, soit{" "}
                {calcul.payants} payant{calcul.payants > 1 ? "s" : ""}
              </Text>
            </View>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 24, color: C.encre }}>{prixClient(calcul.prixParPayant)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, paddingHorizontal: 12 }}>
            <Text>Montant total du voyage pour le groupe</Text>
            <Text style={s.gras}>{prixClient(calcul.totalVente)}</Text>
          </View>
        </View>

        {d.tarif.afficherPostes && postes.length > 0 ? (
          <View style={{ marginTop: 10 }} wrap={false}>
            <View style={s.table}>
              <View style={s.teteLigne}>
                <Text style={[s.tete, { flex: 1 }]}>Répartition du prix</Text>
                <Text style={[s.tete, { width: 110, textAlign: "right" }]}>{qui}</Text>
              </View>
              {postes.map((c) => (
                <View key={c.cle} style={s.ligne}>
                  <Text style={[s.cell, { flex: 1 }]}>{c.label}</Text>
                  <Text style={[s.cell, { width: 110, textAlign: "right" }]}>
                    {prixClient(Math.round((calcul.postes[c.cle].vente / diviseur) * 100) / 100)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {calcul.options.length > 0 ? (
          <View style={{ marginTop: 10 }} wrap={false}>
            <View style={s.table}>
              <View style={[s.teteLigne, { backgroundColor: C.orange }]}>
                <Text style={[s.tete, { flex: 1 }]}>Options proposées, non comprises dans le prix</Text>
                <Text style={[s.tete, { width: 110, textAlign: "right" }]}>{qui}</Text>
              </View>
              {calcul.options.map((o) => (
                <View key={o.id} style={s.ligne}>
                  <Text style={[s.cell, { flex: 1 }]}>{o.libelle}</Text>
                  <Text style={[s.cell, { width: 110, textAlign: "right" }]}>
                    + {prixClient(Math.round(o.parPayant * 100) / 100)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Pied />
      </Page>

      {d.programme.length > 0 ? (
        <Page size="A4" style={s.page}>
          <Entete logo={logo} titre="Programme" reference={d.reference} />
          {d.programme.map((jour, index) => {
            const etapes = jour.etapes.filter((e) => e.libelle.trim());
            return (
              <View key={jour.id} style={{ marginBottom: 10 }} wrap={false}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{ backgroundColor: C.vertFonce, color: C.blanc, fontFamily: "Helvetica-Bold", fontSize: 8, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 2, marginRight: 8 }}>
                    JOUR {index + 1}
                  </Text>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, flex: 1 }}>{jour.titre}</Text>
                  <Text style={s.petit}>{formatJour(dateDuJour(d, index))}</Text>
                </View>
                <View style={{ borderLeftWidth: 2, borderLeftColor: C.vert, paddingLeft: 10 }}>
                  {jour.resume.trim() ? <Paragraphes texte={jour.resume.trim()} /> : null}
                  {etapes.map((e) => (
                    <View key={e.id} style={s.puce}>
                      <Text style={s.puceSigne}>•</Text>
                      <Text style={s.puceTexte}>
                        <Text style={s.gras}>{e.libelle}</Text>
                        {e.lieu ? `, ${e.lieu}` : ""}
                        {e.detail ? ` : ${e.detail}` : ""}
                      </Text>
                    </View>
                  ))}
                  {jour.nuit.trim() ? <Text style={s.petit}>Nuit : {jour.nuit}</Text> : null}
                </View>
              </View>
            );
          })}
          <Text style={[s.petit, { marginTop: 4 }]}>
            Programme donné à titre indicatif : l&apos;ordre des visites peut être adapté selon les disponibilités et les
            horaires de réservation.
          </Text>
          <Pied />
        </Page>
      ) : null}

      <Page size="A4" style={s.page}>
        <Entete logo={logo} titre="Conditions" reference={d.reference} />

        <Text style={[s.h2, { marginTop: 0 }]}>Le prix comprend</Text>
        <Puces texte={d.textes.comprend} />

        {visites.length > 0 ? (
          <View>
            <Text style={s.h2}>Visites et activités réservées</Text>
            <Puces
              texte={visites
                .map((p) => {
                  const index = d.programme.findIndex((j) => j.id === p.jourId);
                  return index >= 0 ? `${p.libelle} (jour ${index + 1})` : p.libelle;
                })
                .join("\n")}
            />
          </View>
        ) : null}

        <Text style={s.h2}>Le prix ne comprend pas</Text>
        <Puces texte={d.textes.neComprendPas} />

        <Text style={s.h2}>Conditions</Text>
        <Puces
          texte={[
            `Devis valable jusqu'au ${dateFr(validite)}.`,
            `Prix calculé pour ${calcul.payants} participant${calcul.payants > 1 ? "s" : ""} payant${calcul.payants > 1 ? "s" : ""}.`,
            d.tarif.acomptePct > 0
              ? `Acompte de ${d.tarif.acomptePct} % à la signature du contrat, soit ${prixClient(Math.round(calcul.totalVente * d.tarif.acomptePct) / 100)}.`
              : "",
            d.textes.conditions,
            avecCgv ? "Les conditions générales et particulières de vente jointes font partie de ce devis." : "",
          ]
            .filter(Boolean)
            .join("\n")}
        />

        <View style={{ marginTop: 22, flexDirection: "row", justifyContent: "space-between" }} wrap={false}>
          <View style={{ width: "46%" }}>
            <Text>Bien cordialement,</Text>
            <Text style={[s.gras, { marginTop: 8 }]}>{d.suiviPar || AGENCE.signataire}</Text>
            <Text>{AGENCE.nom}</Text>
          </View>
          <View style={{ width: "50%", borderWidth: 1, borderColor: C.trait, borderRadius: 3, padding: 10, height: 118 }}>
            <Text style={s.gras}>Bon pour accord</Text>
            <Text style={s.petit}>
              Devis {d.reference}, {prixClient(calcul.prixParPayant)} {qui}
            </Text>
            {avecCgv ? <Text style={s.petit}>Je reconnais avoir pris connaissance des conditions de vente jointes.</Text> : null}
            <Text style={[s.petit, { marginTop: 6 }]}>Date, nom, cachet de l&apos;établissement et signature :</Text>
          </View>
        </View>

        <Pied />
      </Page>

      {avecCgv ? <PagesCgv texte={cgv} logo={logo} reference={d.reference} /> : null}
    </Document>
  );
}
