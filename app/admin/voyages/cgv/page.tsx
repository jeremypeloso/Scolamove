"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Apercu } from "@/components/voyage/Apercu";
import { analyserCgv, CGV_DEFAUT } from "@/lib/voyage/cgv";
import { enregistrerCgv, lireCgv } from "@/lib/voyage/store";

export default function PageCgv() {
  const [texte, setTexte] = useState("");
  const [enregistre, setEnregistre] = useState("");
  const [majLe, setMajLe] = useState<string | null>(null);
  const [charge, setCharge] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [apercu, setApercu] = useState<string | null>(null);

  useEffect(() => {
    lireCgv().then((cgv) => {
      setTexte(cgv.texte);
      setEnregistre(cgv.personnalise ? cgv.texte : "");
      setMajLe(cgv.majLe);
      setCharge(true);
    });
  }, []);

  const modifie = charge && texte !== (enregistre || CGV_DEFAUT);
  const blocs = analyserCgv(texte);
  const articles = blocs.filter((b) => b.type === "article").length;

  // Quitter la page avec un texte non enregistré demande confirmation.
  useEffect(() => {
    const avertir = (e: BeforeUnloadEvent) => {
      if (modifie) e.preventDefault();
    };
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [modifie]);

  async function enregistrer() {
    setOccupe(true);
    setErreur("");
    setMessage("");
    try {
      await enregistrerCgv(texte);
      setEnregistre(texte);
      setMajLe(new Date().toISOString());
      setMessage("Conditions de vente enregistrées. Les prochains devis générés les reprennent.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible");
    }
    setOccupe(false);
  }

  async function voir() {
    setOccupe(true);
    setErreur("");
    try {
      const { cgvBlob } = await import("@/lib/voyage/pdf/generer");
      setApercu(URL.createObjectURL(await cgvBlob(texte)));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Aperçu impossible");
    }
    setOccupe(false);
  }

  return (
    <>
      <div className="vg-barre">
        <Link className="vg-retour" href="/admin/voyages">
          Dossiers
        </Link>
        <div className="vg-barre-titre">
          <strong>Conditions de vente</strong>
          <span>Jointes à la suite de chaque devis</span>
        </div>
        <span className="vg-sauvegarde" role="status">
          {!charge ? "Chargement…" : modifie ? "Modifications non enregistrées" : majLe ? `Enregistrées le ${new Date(majLe).toLocaleDateString("fr-FR")}` : "Texte d'origine"}
        </span>
        <button type="button" className="vg-btn" disabled={occupe || !charge} onClick={voir}>
          Aperçu
        </button>
        <button type="button" className="vg-btn vg-btn-plein" disabled={occupe || !modifie} onClick={enregistrer}>
          Enregistrer
        </button>
      </div>

      <div className="vg-page vg-cgv">
        {erreur ? <p className="vg-message vg-erreur">{erreur}</p> : null}
        {message ? <p className="vg-message">{message}</p> : null}

        <section className="vg-bloc">
          <div className="vg-bloc-tete">
            <div>
              <h2>Texte des conditions</h2>
              <p className="vg-note">
                {articles} article{articles > 1 ? "s" : ""}. Une modification vaut pour tous les devis générés ensuite ; les PDF déjà envoyés ne changent pas.
              </p>
            </div>
            <button
              type="button"
              className="vg-btn"
              disabled={texte === CGV_DEFAUT}
              onClick={() => {
                if (window.confirm("Remplacer le texte par les conditions d'origine ? Il faudra encore enregistrer.")) setTexte(CGV_DEFAUT);
              }}
            >
              Rétablir le texte d&apos;origine
            </button>
          </div>
          <textarea className="vg-input vg-cgv-texte" value={texte} spellCheck onChange={(e) => setTexte(e.target.value)} aria-label="Texte des conditions de vente" />
        </section>

        <aside className="vg-bloc vg-cgv-aide">
          <h2>Mise en forme</h2>
          <p className="vg-note">Une ligne par élément, les lignes vides sont ignorées.</p>
          <dl>
            <dt># Titre</dt>
            <dd>Grande partie (Conditions générales, Conditions particulières)</dd>
            <dt>## Titre</dt>
            <dd>Article</dd>
            <dt>- texte</dt>
            <dd>Puce</dd>
            <dt>&nbsp;&nbsp;- texte</dt>
            <dd>Sous-puce : deux espaces avant le tiret</dd>
            <dt>texte</dt>
            <dd>Paragraphe</dd>
          </dl>
          <p className="vg-note">
            Dans chaque dossier, l&apos;étape Devis permet de joindre ou non ces conditions.
          </p>
        </aside>
      </div>

      {apercu ? <Apercu url={apercu} titre="Conditions de vente" fermer={() => setApercu(null)} /> : null}
    </>
  );
}
