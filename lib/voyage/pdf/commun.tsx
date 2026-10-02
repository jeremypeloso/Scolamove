import { Font, Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { AGENCE, mentionsLegales } from "../agence";

// Pas de césure automatique : les mots coupés gênent la lecture des tableaux.
Font.registerHyphenationCallback((mot) => [mot]);

// Charte Scolamove : orange et vert du logo, encre sombre, fonds crème.
export const C = {
  encre: "#1c2526",
  gris: "#5d6a6c",
  trait: "#dcd8cc",
  fond: "#f6f3ea",
  vert: "#8fb81e",
  vertFonce: "#3d5a17",
  vertClair: "#eef4dc",
  orange: "#ea5b0c",
  blanc: "#ffffff",
};

// Deux particularités du moteur PDF à respecter ici :
// - pas d'interligne au niveau de la page, il ferait disparaître le pied de page
//   (le numéro de page calculé au rendu ne supporte pas un interligne hérité) ;
// - un interligne se déclare toujours avec sa taille de police dans le même
//   style, sinon il est calculé sur la taille par défaut du moteur (18 pt).
export const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 58, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 9.5, color: C.encre },
  entete: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 2, borderBottomColor: C.vert, paddingBottom: 8, marginBottom: 18 },
  logo: { width: 150, height: 34, objectFit: "contain", objectPosition: "left" },
  marque: { fontFamily: "Helvetica-Bold", fontSize: 18 },
  enteteDroite: { alignItems: "flex-end" },
  docTitre: { fontFamily: "Helvetica-Bold", fontSize: 15, color: C.encre },
  docRef: { fontSize: 9, color: C.gris, marginTop: 2 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: C.vertFonce, marginTop: 14, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: C.trait },
  h3: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 3 },
  p: { marginBottom: 6, fontSize: 9.5, lineHeight: 1.45 },
  gras: { fontFamily: "Helvetica-Bold" },
  petit: { fontSize: 8.5, color: C.gris },
  puce: { flexDirection: "row", marginBottom: 2.5 },
  puceSigne: { width: 10, color: C.vert, fontFamily: "Helvetica-Bold" },
  puceTexte: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
  table: { borderWidth: 1, borderColor: C.trait },
  ligne: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.trait },
  lignePremiere: { flexDirection: "row" },
  teteLigne: { flexDirection: "row", backgroundColor: C.vertFonce },
  tete: { color: C.blanc, fontFamily: "Helvetica-Bold", fontSize: 8.5, padding: 5 },
  cell: { padding: 5, fontSize: 9 },
  cle: { width: 110, padding: 5, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.vertFonce, backgroundColor: C.fond },
  valeur: { flex: 1, padding: 5, fontSize: 9.5 },
  pied: { position: "absolute", left: 40, right: 40, bottom: 22, borderTopWidth: 1, borderTopColor: C.trait, paddingTop: 5, flexDirection: "row", justifyContent: "space-between" },
  piedTexte: { fontSize: 6.8, color: C.gris, flex: 1, paddingRight: 12, lineHeight: 1.35 },
  piedPage: { fontSize: 7.5, color: C.gris },
});

export function Entete({ logo, titre, reference }: { logo: string; titre: string; reference: string }) {
  return (
    <View style={s.entete} fixed>
      {/* Image du moteur PDF, sans attribut alt. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {logo ? <Image src={logo} style={s.logo} /> : <Text style={s.marque}>{AGENCE.nom}</Text>}
      <View style={s.enteteDroite}>
        <Text style={s.docTitre}>{titre}</Text>
        <Text style={s.docRef}>Dossier {reference}</Text>
      </View>
    </View>
  );
}

export function Pied() {
  const coordonnees = [AGENCE.telephone, AGENCE.email, AGENCE.site].filter(Boolean).join(" · ");
  return (
    <View style={s.pied} fixed>
      <Text style={s.piedTexte}>
        {mentionsLegales()}
        {coordonnees ? `\n${coordonnees}` : ""}
      </Text>
      <Text style={s.piedPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export function Puces({ texte }: { texte: string }) {
  const lignes = texte.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <View>
      {lignes.map((l, i) => (
        <View key={i} style={s.puce} wrap={false}>
          <Text style={s.puceSigne}>•</Text>
          <Text style={s.puceTexte}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

export function Paragraphes({ texte, taille = 9.5 }: { texte: string; taille?: number }) {
  return (
    <View>
      {texte.split("\n").map((l, i) =>
        l.trim() ? (
          <Text key={i} style={{ marginBottom: 6, fontSize: taille, lineHeight: 1.45 }}>
            {l}
          </Text>
        ) : (
          <View key={i} style={{ height: 4 }} />
        )
      )}
    </View>
  );
}

// Tableau « libellé : valeur » sur une colonne.
export function Fiche({ lignes }: { lignes: [string, string][] }) {
  const utiles = lignes.filter(([, v]) => v && v.trim());
  return (
    <View style={s.table}>
      {utiles.map(([k, v], i) => (
        <View key={k} style={i === 0 ? s.lignePremiere : s.ligne} wrap={false}>
          <Text style={s.cle}>{k}</Text>
          <Text style={s.valeur}>{v}</Text>
        </View>
      ))}
    </View>
  );
}
