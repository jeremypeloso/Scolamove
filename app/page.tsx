import FeaturedCarousel from "@/components/FeaturedCarousel";
import Header from "@/components/Header";
import QuoteForm from "@/components/QuoteForm";
import TripsSection from "@/components/TripsSection";
import { sejours } from "@/lib/sejours";
import DestinationCarousel from "@/components/DestinationCarousel";
import TrustpilotReviews from "@/components/TrustpilotReviews";



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
              <h1>Construisez un séjour scolaire serein, du programme jusqu’au transport.</h1>
              <p className="hero-text">
  Scolamove accompagne les enseignants avec des voyages éducatifs clés en main
  et une maîtrise directe du transport grâce à sa propre flotte d’autocars.
</p>
              
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

            <FeaturedCarousel />
          </div>
        </section>

        <section className="reassurance-section">
  <div className="container reassurance-grid">
    <div className="reassurance-main">
      <span>Sécurité & accompagnement</span>
      <h2>Une organisation rassurante, même quand le voyage se complique.</h2>
      <p>
        Pour un établissement scolaire, la sérénité repose autant sur la qualité du
        programme que sur la capacité à gérer les imprévus. Scolamove accompagne
        les enseignants avec une organisation claire, des prestataires suivis et
        une vraie maîtrise du transport grâce à sa flotte d’autocars.
      </p>

      <div className="reassurance-proof">
        <strong>1 interlocuteur dédié</strong>
        <small>du premier échange jusqu’au retour du groupe</small>
      </div>
    </div>

    <div className="reassurance-list">
      <article>
        <span>01</span>
        <div>
          <h3>Prestations contrôlées</h3>
          <p>Des hébergements, visites et services sélectionnés pour les groupes scolaires.</p>
        </div>
      </article>

      <article>
        <span>02</span>
        <div>
          <h3>Transport maîtrisé</h3>
          <p>Une organisation facilitée par notre propre flotte d’autocars.</p>
        </div>
      </article>

      <article>
        <span>03</span>
        <div>
          <h3>Solutions en cas d’imprévu</h3>
          <p>Nous cherchons rapidement une alternative si une prestation doit être adaptée.</p>
        </div>
      </article>

      <article>
        <span>04</span>
        <div>
          <h3>Dossier clair pour l’établissement</h3>
          <p>Des éléments lisibles pour présenter le projet à la direction et aux familles.</p>
        </div>
      </article>
    </div>
  </div>
</section>

        <TripsSection />

        <DestinationCarousel />

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