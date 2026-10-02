import type { Calcul } from "@/lib/voyage/calcul";
import type { Onglet } from "@/lib/voyage/controle";
import type { Dossier, Prestataire } from "@/lib/voyage/types";

export type PropsOnglet = {
  d: Dossier;
  maj: (f: (d: Dossier) => Dossier) => void;
  calcul: Calcul;
  prestataires: Prestataire[];
  rechargerPrestataires: () => Promise<void>;
  allerA: (onglet: Onglet) => void;
};
