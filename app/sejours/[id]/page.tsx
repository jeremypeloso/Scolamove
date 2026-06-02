"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

export default function SejourPage() {
  const params = useParams<{ id: string }>();
  const [sejour, setSejour] = useState<SupabaseSejour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSejour() {
      const { data, error } = await supabase
        .from("sejours")
        .select("*")
        .eq("slug", params.id)
        .eq("hidden", false)
        .single();

      if (!error && data) {
        setSejour(data);
      }

      setLoading(false);
    }

    loadSejour();
  }, [params.id]);

  const includedItems = useMemo(
    () => [
      sejour?.transport,
      sejour?.accommodation,
      sejour?.level,
      sejour?.duration,
      sejour?.visit_budget,
      sejour?.possible_visits,
    ].filter(Boolean),
    [sejour]
  );

  if (loading) {
    return (
      <>
        <Header />
        <main className="trip-not-found">
          <p>Chargement du séjour...</p>
        </main>
      </>
    );
  }

  if (!sejour) {
    return (
      <>
        <Header />
        <main className="trip-not-found">
          <h1>Séjour introuvable</h1>
          <p>Ce séjour n’existe pas ou n’est plus disponible.</p>
          <a href="/#sejours" className="btn btn-primary">
            Retour au catalogue
          </a>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main>
        <section className="detail-hero">
          <div className="container detail-hero-grid">
            <div>
              {sejour.badge && (
                <span className="detail-badge">{sejour.badge}</span>
              )}

              <p className="detail-kicker">
                {sejour.country} · {sejour.language}
              </p>

              <h1>{sejour.title}</h1>

              <p className="detail-lead">{sejour.description}</p>

              <div className="detail-points">
                <span>{sejour.duration}</span>
                <span>{sejour.level}</span>
                <span>{sejour.accommodation}</span>
                <span>{sejour.transport}</span>
              </div>
            </div>

            <div
              className="detail-photo"
              style={{ backgroundImage: `url(${sejour.image})` }}
            />
          </div>
        </section>

        <section className="detail-nav-wrap">
          <div className="container detail-nav">
            <a href="#introduction">Introduction</a>
            <a href="#programme">Programme</a>
            <a href="#objectifs">Objectifs</a>
            <a href="#infos-pratiques">Infos pratiques</a>
            <a href="#hebergement">Hébergement</a>
            <a href="#transport">Transport</a>
            <a href="#inclus">Inclus</a>
            <a href="#devis-detail">Devis</a>
          </div>
        </section>

        <section className="detail-main">
          <div className="container detail-layout">
            <article className="detail-content">
              <section id="introduction" className="detail-section">
                <h2>Introduction</h2>
                <p>
                  Ce séjour est conçu pour offrir aux élèves une expérience
                  pédagogique concrète, motivante et facile à intégrer dans un
                  projet d’établissement. Le programme peut être ajusté selon
                  votre période, votre budget et les contraintes de votre groupe.
                </p>
              </section>

              <section id="programme" className="detail-section">
                <h2>Programme</h2>

                {sejour.program?.length ? (
                  <div className="program-list">
                    {sejour.program.map((item) => (
                      <article key={`${item.day}-${item.title}`}>
                        <span>{item.day}</span>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>Le programme détaillé sera précisé dans la proposition.</p>
                )}
              </section>

              <section id="objectifs" className="detail-section">
                <h2>Objectifs pédagogiques</h2>

                {sejour.objectives?.length ? (
                  <ul className="detail-objectives">
                    {sejour.objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Les objectifs pédagogiques seront adaptés à votre projet et
                    au niveau de vos élèves.
                  </p>
                )}
              </section>

              <section id="infos-pratiques" className="detail-section">
                <h2>Informations pratiques</h2>

                <div className="included-grid">
                  {includedItems.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </section>

              <section id="hebergement" className="detail-section">
                <h2>Hébergement</h2>
                <p>
                  Hébergement prévu en {sejour.accommodation.toLowerCase()},
                  selon les disponibilités et le format retenu. Les solutions
                  proposées sont sélectionnées pour leur sérieux, leur
                  localisation et leur adaptation aux groupes scolaires.
                </p>
              </section>

              <section id="transport" className="detail-section">
                <h2>Transport</h2>
                <p>
                  Transport possible en {sejour.transport.toLowerCase()}, avec
                  coordination des horaires, transferts et contraintes de groupe.
                  Les modalités exactes sont précisées dans la proposition
                  personnalisée.
                </p>
              </section>

              <section id="inclus" className="detail-section">
                <h2>Inclus dans le séjour</h2>

                <div className="included-grid">
                  <span>Transport selon formule</span>
                  <span>Hébergement</span>
                  <span>Programme de visites</span>
                  <span>Dossier établissement</span>
                  <span>Assistance Scolamove</span>
                  <span>Proposition personnalisée</span>
                </div>
              </section>
            </article>

            <aside className="detail-sidebar" id="devis-detail">
              <div className="detail-summary-card">
                <h2>Récapitulatif</h2>

                <dl>
                  <div>
                    <dt>Destination</dt>
                    <dd>{sejour.destination}</dd>
                  </div>

                  <div>
                    <dt>Durée</dt>
                    <dd>{sejour.duration}</dd>
                  </div>

                  <div>
                    <dt>Niveau</dt>
                    <dd>{sejour.level}</dd>
                  </div>

                  <div>
                    <dt>Thème</dt>
                    <dd>{sejour.language}</dd>
                  </div>

                  <div>
                    <dt>À partir de</dt>
                    <dd className="detail-price">{sejour.price}</dd>
                  </div>
                </dl>

                <a href={`/devis?sejour=${sejour.slug}`} className="btn btn-primary">
  Demander un devis
</a>

                <a href="/sejours" className="btn btn-white">
  Retour au catalogue
</a>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}