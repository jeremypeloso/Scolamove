"use client";

import { FormEvent, useState } from "react";

const trips = [
  {
    title: "Londres essentiel",
    text: "Un programme équilibré entre pratique de l’anglais, visites incontournables et immersion culturelle.",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
    badge: "Best-seller",
    meta: ["5 jours", "Collège/Lycée", "Familles", "Bus ou train"],
    price: "395€",
  },
  {
    title: "Dublin authentique",
    text: "Une destination chaleureuse pour améliorer l’anglais et découvrir la culture irlandaise.",
    image:
      "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=1000&q=80",
    badge: "Immersion",
    meta: ["6 jours", "Anglais", "Familles", "Culture"],
    price: "449€",
  },
  {
    title: "Malte anglais",
    text: "Cours de langue, visites et cadre méditerranéen pour un séjour très motivant.",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=80",
    badge: "Soleil",
    meta: ["7 jours", "Cours possibles", "Résidence", "Avion"],
    price: "499€",
  },
];

const destinations = [
  ["Londres", "Anglais, musées, monuments et culture britannique.", "dest big"],
  ["Dublin", "Immersion et culture irlandaise.", "dest dublin"],
  ["Malte", "Anglais, soleil et cours de langue.", "dest malte"],
  ["Barcelone", "Espagnol, art et architecture.", "dest barca"],
  ["Berlin", "Allemand et histoire européenne.", "dest berlin"],
];

const steps = [
  ["Vous décrivez le projet", "Destination, classe, dates, nombre d’élèves et budget."],
  ["Nous préparons l’offre", "Programme, transport, hébergement, visites et prix."],
  ["Vous faites valider", "Un dossier clair pour l’établissement et les familles."],
  ["Le séjour démarre", "Coordination et assistance tout au long du voyage."],
];

export default function Home() {
  const [status, setStatus] = useState("Sans engagement · réponse personnalisée");

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Envoi en cours...");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const response = await fetch("/api/devis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      setStatus(result.message);
      form.reset();
    } else {
      setStatus(result.error || "Impossible d’envoyer la demande.");
    }
  }

  return (
    <>
      <div className="top-offer">
        Offre établissements : recevez une proposition de séjour scolaire personnalisée sous 48h
      </div>

      <div className="contact-bar">
        <div className="contact-inner">
          <span>Agence spécialisée dans les voyages scolaires linguistiques</span>
          <span>
            <strong>Conseiller Scolamove :</strong> 01 00 00 00 00 · contact@scolamove.fr
          </span>
        </div>
      </div>

      <header>
        <div className="nav">
          <a className="logo" href="#top">
            Scola<span>move</span>
          </a>
          <nav className="menu">
            <a href="#sejours">Nos séjours</a>
            <a href="#agence">L’agence</a>
            <a href="#destinations">Destinations</a>
            <a href="#process">Comment ça marche</a>
          </nav>
          <a href="#devis" className="btn btn-primary">
            Demander un devis
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-inner">
            <div>
              <div className="label">Voyagiste scolaire linguistique</div>
              <h1>Des séjours linguistiques scolaires clés en main.</h1>
              <p className="hero-text">
                Scolamove aide les enseignants à organiser des voyages éducatifs fiables,
                attractifs et faciles à présenter aux familles comme à la direction.
              </p>

              <div className="hero-actions">
                <a href="#devis" className="btn btn-primary">
                  Créer mon projet de séjour
                </a>
                <a href="#sejours" className="btn btn-white">
                  Voir les idées de séjours
                </a>
              </div>

              <div className="hero-points">
                <div className="point">
                  <strong>48h</strong>
                  <span>pour une première proposition</span>
                </div>
                <div className="point">
                  <strong>A-Z</strong>
                  <span>transport, hébergement, visites</span>
                </div>
                <div className="point">
                  <strong>1</strong>
                  <span>interlocuteur dédié</span>
                </div>
              </div>
            </div>

            <form className="search-card" id="devis" onSubmit={submitQuote}>
              <h2>Où voulez-vous emmener vos élèves ?</h2>
              <p>Recevez une proposition claire avec budget, programme et organisation.</p>

              <div className="form-grid">
                <div className="field">
                  <label>Destination</label>
                  <select name="destination" defaultValue="Londres">
                    <option>Londres</option>
                    <option>Dublin</option>
                    <option>Malte</option>
                    <option>Barcelone</option>
                    <option>Berlin</option>
                    <option>Sur mesure</option>
                  </select>
                </div>

                <div className="field">
                  <label>Niveau scolaire</label>
                  <select name="niveau" defaultValue="Collège">
                    <option>Collège</option>
                    <option>Lycée</option>
                    <option>Primaire</option>
                    <option>Supérieur</option>
                  </select>
                </div>

                <div className="field">
                  <label>Nombre d’élèves *</label>
                  <input name="eleves" type="number" placeholder="Ex : 42" required />
                </div>

                <div className="field">
                  <label>Période *</label>
                  <input name="periode" type="text" placeholder="Ex : avril 2026" required />
                </div>

                <div className="field">
                  <label>Votre nom *</label>
                  <input name="nom" type="text" placeholder="Ex : Mme Martin" required />
                </div>

                <div className="field">
                  <label>Email *</label>
                  <input name="email" type="email" placeholder="vous@etablissement.fr" required />
                </div>
              </div>

              <button type="submit" className="btn btn-yellow">
                Recevoir mon devis
              </button>
              <p className="mini-note">{status}</p>
            </form>
          </div>
        </section>

        <section className="trust-section">
          <div className="container">
            <div className="trust-box">
              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <strong>Voyage sur mesure</strong>
                <span>adapté au projet pédagogique</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <strong>Dossier prêt</strong>
                <span>pour chef d’établissement et parents</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <strong>Sécurité</strong>
                <span>prestataires et hébergements sélectionnés</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">✓</div>
                <strong>Assistance</strong>
                <span>avant, pendant et après le séjour</span>
              </div>
            </div>
          </div>
        </section>

        <section id="sejours">
          <div className="container">
            <div className="section-head">
              <h2>Nos idées de séjours scolaires linguistiques.</h2>
              <p>
                Des propositions lisibles, comparables et conçues pour déclencher rapidement une
                demande de devis.
              </p>
            </div>

            <div className="tabs">
              <span className="tab active">Best-sellers</span>
              <span className="tab">Anglais</span>
              <span className="tab">Espagnol</span>
              <span className="tab">Allemand</span>
              <span className="tab">Sur mesure</span>
            </div>

            <div className="trip-grid">
              {trips.map((trip) => (
                <article className="trip-card" key={trip.title}>
                  <div className="trip-img" style={{ backgroundImage: `url('${trip.image}')` }}>
                    <span className="ribbon">{trip.badge}</span>
                  </div>
                  <div className="trip-body">
                    <h3>{trip.title}</h3>
                    <p>{trip.text}</p>
                    <div className="trip-meta">
                      {trip.meta.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                    <div className="price-line">
                      <div>
                        <small>à partir de</small>
                        <strong>{trip.price}</strong>
                      </div>
                      <a href="#devis" className="btn btn-blue">
                        Demander
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="agency" id="agence">
          <div className="container agency-grid">
            <div className="agency-photo">
              <div className="agency-badge">
                <strong>Un interlocuteur unique pour votre établissement</strong>
                <span>Moins de charge mentale, plus de clarté pour faire valider le projet.</span>
              </div>
            </div>

            <div className="agency-content">
              <h2>L’esprit d’un vrai voyagiste, spécialisé dans le scolaire.</h2>
              <p>
                Scolamove gère les contraintes d’un établissement : validation interne, familles,
                budget, documents, transport, hébergement et coordination du séjour.
              </p>
              <div className="check-list">
                <div>Programme détaillé et facilement présentable.</div>
                <div>Budget structuré avec options possibles.</div>
                <div>Transport, hébergement, visites et activités coordonnés.</div>
                <div>Documents utiles pour rassurer les parents.</div>
                <div>Accompagnement avant et pendant le séjour.</div>
              </div>
              <a href="#devis" className="btn btn-primary">
                Préparer mon dossier
              </a>
            </div>
          </div>
        </section>

        <section className="destinations" id="destinations">
          <div className="container">
            <div className="section-head">
              <h2>Destinations phares pour apprendre autrement.</h2>
              <p>Un affichage visuel qui donne envie, tout en restant orienté demande de devis.</p>
            </div>

            <div className="dest-grid">
              {destinations.map(([title, text, className]) => (
                <div className={className} key={title}>
                  <div className="dest-content">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process">
          <div className="container">
            <div className="section-head">
              <h2>Une organisation simple en 4 étapes.</h2>
              <p>
                Le parcours doit être rassurant et lisible pour pousser l’enseignant à passer à
                l’action.
              </p>
            </div>

            <div className="process-grid">
              {steps.map(([title, text], index) => (
                <div className="process" key={title}>
                  <div className="number">{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container">
            <h2>Prêt à construire votre prochain séjour scolaire ?</h2>
            <p>Recevez une première proposition personnalisée et facile à présenter.</p>
            <div className="cta-actions">
              <a href="#devis" className="btn btn-yellow">
                Demander un devis gratuit
              </a>
              <a href="#sejours" className="btn btn-white">
                Voir les séjours
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-grid">
          <div>
            <h3>Scolamove</h3>
            <p>Agence de voyages spécialisée dans les séjours linguistiques scolaires clés en main.</p>
          </div>
          <div>
            <h3>Séjours</h3>
            <a href="#sejours">Londres</a>
            <a href="#sejours">Dublin</a>
            <a href="#sejours">Malte</a>
            <a href="#sejours">Barcelone</a>
          </div>
          <div>
            <h3>Enseignants</h3>
            <a href="#devis">Créer un projet</a>
            <a href="#process">Dossier pédagogique</a>
            <a href="#agence">FAQ parents</a>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="tel:+33100000000">01 00 00 00 00</a>
            <a href="mailto:contact@scolamove.fr">contact@scolamove.fr</a>
            <a href="#devis">Demander un devis</a>
          </div>
        </div>
      </footer>
    </>
  );
}