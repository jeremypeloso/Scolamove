import { pdf } from "@react-pdf/renderer";
import { calculer } from "../calcul";
import { lireCgv } from "../store";
import type { Dossier, Prestataire } from "../types";
import { CgvPdf } from "./CgvPdf";
import { DevisPdf } from "./DevisPdf";
import { FeuilleRoutePdf } from "./FeuilleRoutePdf";

// Ce module embarque le moteur PDF : il est chargé à la demande (import
// dynamique) pour ne pas alourdir l'écran de saisie.

let logoEnCache: string | null = null;

export async function chargerLogo(): Promise<string> {
  if (logoEnCache !== null) return logoEnCache;
  logoEnCache = await new Promise<string>((resolve) => {
    const img = document.createElement("img");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
    img.src = "/images/logo-scolamove.png";
  });
  return logoEnCache;
}

export async function devisBlob(dossier: Dossier): Promise<Blob> {
  const logo = await chargerLogo();
  const cgv = dossier.tarif.joindreCgv ? (await lireCgv()).texte : "";
  return pdf(<DevisPdf dossier={dossier} calcul={calculer(dossier)} logo={logo} cgv={cgv} />).toBlob();
}

export async function cgvBlob(texte: string): Promise<Blob> {
  const logo = await chargerLogo();
  return pdf(<CgvPdf texte={texte} logo={logo} />).toBlob();
}

export async function feuilleRouteBlob(dossier: Dossier, prestataires: Prestataire[]): Promise<Blob> {
  const logo = await chargerLogo();
  return pdf(<FeuilleRoutePdf dossier={dossier} prestataires={prestataires} logo={logo} />).toBlob();
}
