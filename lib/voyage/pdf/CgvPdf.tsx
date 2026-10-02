import { Document, Page, Text, View } from "@react-pdf/renderer";
import { AGENCE } from "../agence";
import { analyserCgv, type BlocCgv } from "../cgv";
import { C, Entete, Pied, s } from "./commun";

// Les conditions de vente s'impriment sur deux colonnes, en petit corps. Le
// moteur PDF ne sait pas faire couler un texte d'une colonne à l'autre : on
// estime la hauteur de chaque bloc et on remplit les colonnes une à une.

const CORPS = 7.2;
const INTERLIGNE = 1.32;
const LARGEUR = 247;
// Hauteur utile d'une colonne, volontairement en dessous de la hauteur réelle
// pour absorber les erreurs d'estimation.
const CAPACITE = 660;
const CARACTERES = 74;

// La police des PDF ne connaît que l'alphabet latin : tout autre signe
// (émoji, indice, flèche) est retiré plutôt qu'imprimé de travers.
function nettoyer(texte: string): string {
  return texte
    .replace(/₂/g, "2")
    .replace(/[^\u0020-\u00ff\u0152\u0153\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u20ac]/g, "")
    .trim();
}

function hauteur(b: BlocCgv): number {
  const ligne = CORPS * INTERLIGNE;
  if (b.type === "partie") return 26;
  if (b.type === "article") return 19 + Math.max(Math.ceil(b.texte.length / 44) - 1, 0) * 11;
  const retrait = b.type === "puce" ? 9 : b.type === "souspuce" ? 18 : 0;
  const parLigne = Math.floor((CARACTERES * (LARGEUR - retrait)) / LARGEUR);
  return Math.max(Math.ceil(b.texte.length / parLigne), 1) * ligne + 2.2;
}

// Remplit les colonnes ; un titre d'article n'est jamais laissé seul en bas.
function repartir(blocs: BlocCgv[]): BlocCgv[][] {
  const colonnes: BlocCgv[][] = [[]];
  let occupe = 0;
  blocs.forEach((b, i) => {
    const h = hauteur(b);
    const suivant = blocs[i + 1];
    const besoin = b.type === "article" || b.type === "partie" ? h + (suivant ? hauteur(suivant) : 0) : h;
    if (occupe > 0 && occupe + besoin > CAPACITE) {
      colonnes.push([]);
      occupe = 0;
    }
    colonnes[colonnes.length - 1].push(b);
    occupe += h;
  });
  return colonnes;
}

function Bloc({ b, premier }: { b: BlocCgv; premier: boolean }) {
  const texte = { fontSize: CORPS, lineHeight: INTERLIGNE, color: C.encre };
  if (b.type === "partie") {
    return (
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5, color: C.vertFonce, marginTop: premier ? 0 : 10, marginBottom: 6 }}>
        {nettoyer(b.texte)}
      </Text>
    );
  }
  if (b.type === "article") {
    return (
      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.2, color: C.orange, marginTop: premier ? 0 : 7, marginBottom: 3 }}>
        {nettoyer(b.texte)}
      </Text>
    );
  }
  if (b.type === "texte") return <Text style={{ ...texte, marginBottom: 2.2 }}>{nettoyer(b.texte)}</Text>;
  return (
    <View style={{ flexDirection: "row", marginBottom: 2.2, paddingLeft: b.type === "souspuce" ? 9 : 0 }}>
      <Text style={{ ...texte, width: 9 }}>{b.type === "souspuce" ? "–" : "•"}</Text>
      <Text style={{ ...texte, flex: 1 }}>{nettoyer(b.texte)}</Text>
    </View>
  );
}

// Pages « Conditions de vente », à insérer dans un document.
export function PagesCgv({ texte, logo, reference }: { texte: string; logo: string; reference: string }) {
  const colonnes = repartir(analyserCgv(texte));
  const pages: BlocCgv[][][] = [];
  for (let i = 0; i < colonnes.length; i += 2) pages.push(colonnes.slice(i, i + 2));

  return (
    <>
      {pages.map((page, n) => (
        <Page key={n} size="A4" style={s.page}>
          <Entete logo={logo} titre="Conditions de vente" reference={reference} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {page.map((colonne, k) => (
              <View key={k} style={{ width: LARGEUR }}>
                {colonne.map((b, i) => (
                  <Bloc key={i} b={b} premier={i === 0} />
                ))}
              </View>
            ))}
          </View>
          <Pied />
        </Page>
      ))}
    </>
  );
}

// Document autonome, pour l'aperçu depuis l'écran de modification.
export function CgvPdf({ texte, logo }: { texte: string; logo: string }) {
  return (
    <Document title="Conditions de vente" author={AGENCE.nom}>
      <PagesCgv texte={texte} logo={logo} reference="aperçu" />
    </Document>
  );
}
