import FeaturedCarousel from "@/components/FeaturedCarousel";
import Header from "@/components/Header";
import QuoteForm from "@/components/QuoteForm";
import TripsSection from "@/components/TripsSection";
import { sejours } from "@/lib/sejours";

const featuredSejours = sejours.filter((sejour) => sejour.featured);


const steps = [
  ["1", "Décrivez votre projet", "Destination, dates, niveau, effectif et budget."],
  ["2", "Recevez une offre claire", "Programme, transport, hébergement, visites et prix."],
  ["3", "Faites valider facilement", "Un dossier lisible pour l’établissement et les familles."],
  ["4", "Partez accompagné", "Un interlocuteur dédié avant et pendant le séjour."],
];

export default function Home() {
  return (
    <>
      <Header />

      <main id="top">
        <section className="travel-hero">
          <div className="travel-hero-inner">
            <div className="hero-copy-panel">
              <div className="label">Voyages scolaires linguistiques</div>
              <h1>Organisez un séjour scolaire clair, fiable et motivant.</h1>
              <p className="hero-text">
                Scolamove accompagne les enseignants dans la création de voyages éducatifs
                clés en main en Europe.
              </p>
              <div className="hero-actions">
                <a href="#devis" className="btn btn-primary">
                  Rechercher un séjour
                </a>
                <a href="#sejours" className="btn btn-white">
                  Voir le catalogue
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="search-band" id="devis">
  <div className="container">
    <div className="search-shell clean-search-shell">
      <QuoteForm />
    </div>
  </div>
</section>

        <section className="spotlight-section">
          <div className="container">
            <div className="section-head">
              <h2>À ne pas manquer !</h2>
            </div>

            <FeaturedCarousel sejours={featuredSejours} />
          </div>
        </section>

        <section className="assistance-section">
  <div className="container">
    <div className="assistance-head">
      <span>Sécurité & accompagnement</span>
      <h2>
        Une assistance <strong>en cas d’imprévus</strong>
      </h2>
      <p>
        Parce qu’un voyage scolaire doit être rassurant pour l’établissement,
        les enseignants et les familles.
      </p>
    </div>

    <div className="assistance-grid">
      <article>
        <div className="assistance-icon">✓</div>
        <h3>Garantie de conformité</h3>
        <p>Des prestations contrôlées et adaptées aux exigences des voyages scolaires.</p>
      </article>

      <article>
        <div className="assistance-icon">1</div>
        <h3>Interlocuteur unique</h3>
        <p>Un conseiller suit votre dossier du premier échange jusqu’au retour du groupe.</p>
      </article>

      <article>
        <div className="assistance-icon">↻</div>
        <h3>Solutions organisées</h3>
        <p>En cas d’annulation ou de prestation défaillante, nous cherchons une alternative.</p>
      </article>

      <article>
        <div className="assistance-icon">◇</div>
        <h3>Assurances adaptées</h3>
        <p>Des options expliquées clairement pour protéger les élèves et les accompagnateurs.</p>
      </article>

      <article>
        <div className="assistance-icon">●</div>
        <h3>Veille permanente</h3>
        <p>Nous suivons les recommandations officielles et adaptons les parcours si nécessaire.</p>
      </article>
    </div>
  </div>
</section>

        <TripsSection />

        <section className="advisor-band" id="agence">
          <div className="container advisor-inner">
            <div>
              <span className="advisor-kicker">Besoin d’aide ?</span>
              <h2>Un conseiller vous aide à construire le bon séjour.</h2>
              <p>
                Programme, budget, dossier de validation, transport, hébergement, visites :
                Scolamove centralise l’organisation pour alléger la charge des enseignants.
              </p>
            </div>
            <a href="#devis" className="btn btn-yellow">
              Être rappelé
            </a>
          </div>
        </section>

        <section id="process">
          <div className="container">
            <div className="section-head">
              <h2>Une méthode simple.</h2>
              <p>Un parcours pensé pour rassurer l’établissement, les familles et les élèves.</p>
            </div>

            <div className="process-grid">
              {steps.map(([number, title, text]) => (
                <div className="process" key={title}>
                  <div className="number">{number}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-grid">
          <div>
            <h3>Scolamove</h3>
            <p>Agence spécialisée dans les séjours linguistiques scolaires clés en main.</p>
          </div>
          <div>
            <h3>Destinations</h3>
            <a href="#sejours">Londres</a>
            <a href="#sejours">Dublin</a>
            <a href="#sejours">Malte</a>
            <a href="#sejours">Barcelone</a>
          </div>
          <div>
            <h3>Enseignants</h3>
            <a href="#devis">Créer un projet</a>
            <a href="#process">Comment ça marche</a>
            <a href="#agence">Accompagnement</a>
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