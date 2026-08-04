import type { Metadata } from "next";
import Header from "@/components/Header";
import CatalogueClient from "./CatalogueClient";
import "./catalogue.css";

export const metadata: Metadata = {
  title: "Catalogue 2026-2027 — Scolamove",
  description:
    "Feuilletez le catalogue Scolamove 2026-2027 : tous nos voyages scolaires éducatifs et linguistiques en France et en Europe.",
};

export default function CataloguePage() {
  return (
    <>
      <Header />

      <main className="catalogue-main">
        <section className="catalogue-hero">
          <div className="container">
            <div className="label">Édition 2026-2027</div>
            <h1>Feuilletez notre catalogue</h1>
            <p>
              Retrouvez l&apos;ensemble de nos séjours scolaires en France, en
              Italie et en Espagne. Tournez les pages comme sur un vrai
              catalogue, ou téléchargez la version PDF.
            </p>
          </div>
        </section>

        <section className="catalogue-viewer">
          <div className="container">
            <CatalogueClient />
          </div>
        </section>

        <section className="catalogue-cta">
          <div className="container">
            <h2>Un séjour vous intéresse ?</h2>
            <p>
              Décrivez votre projet et recevez une proposition personnalisée
              sous 48h.
            </p>
            <a href="/devis" className="btn btn-primary">
              Demander un devis
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
