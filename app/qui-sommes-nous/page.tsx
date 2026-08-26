import Header from "@/components/Header";

export const metadata = {
  title: "Qui sommes-nous — Scolamove",
  description:
    "Scolamove, l'expertise Festimove au service des voyages scolaires : transport, organisation et sécurité réunis au sein d'un même projet.",
};

export default function QuiSommesNousPage() {
  return (
    <>
      <Header />

      <main>
        <section className="catalogue-hero">
          <div className="container">
            <span>L’agence</span>
            <h1>Scolamove, l’expertise Festimove au service des voyages scolaires</h1>
            <p>
              Scolamove est une marque de Festimove, entreprise spécialisée dans le transport de
              voyageurs et implantée dans l’Oise (60).
            </p>
          </div>
        </section>

        <section className="spotlight-section compact-spotlight-section">
          <div className="container" style={{ maxWidth: 820 }}>
            <p className="hero-text">
              Depuis sa création, Festimove développe son activité autour d’engagements
              essentiels : la sécurité, la ponctualité, la proximité et la qualité de service.
              Forte d’une équipe de conducteurs professionnels expérimentés, d’une organisation
              rigoureuse et d’un parc d’autocars polyvalent, notre société accompagne
              particuliers, professionnels et collectivités dans leurs déplacements en France et
              à l’étranger.
            </p>
            <p className="hero-text">
              En tant que transporteur, nous accompagnons depuis de nombreuses années les groupes
              scolaires de nombreuses agences de voyages vers les principales destinations
              éducatives en France et en Europe.
            </p>
            <p className="hero-text">
              Cette expérience de terrain nous a permis de connaître les destinations, mais aussi
              d’observer concrètement toutes les étapes d’un voyage scolaire : sa préparation, le
              transport, les hébergements, les visites, le déroulement du programme sur place et
              les éventuels imprévus.
            </p>
            <p className="hero-text">
              <strong>C’est de cette expérience qu’est née Scolamove.</strong>
            </p>
          </div>
        </section>

        <section className="reassurance-section">
          <div className="container reassurance-grid">
            <div className="reassurance-main">
              <span>Notre modèle</span>
              <h2>Du transport scolaire à l’organisation complète du voyage</h2>
              <p>
                Nous avons souhaité aller plus loin en proposant un modèle plus simple et plus
                direct : réduire le nombre d’interlocuteurs et d’intermédiaires pour maîtriser
                l’ensemble du processus, depuis la création du voyage et l’élaboration du
                programme jusqu’à son organisation sur place, en passant naturellement par le
                transport.
              </p>
              <p>
                L’objectif est également de tirer parti de notre expérience du terrain pour
                améliorer les points qui peuvent parfois montrer leurs limites dans le
                fonctionnement des agences traditionnelles : multiplication des intermédiaires,
                manque de réactivité, informations qui se perdent entre les différents
                prestataires ou encore difficulté à s’adapter rapidement lorsqu’un imprévu
                survient.
              </p>
              <p>
                Avec Scolamove, nous voulons au contraire privilégier des circuits de décision
                courts, une communication fluide et un interlocuteur qui connaît et maîtrise
                réellement le voyage dans son ensemble.
              </p>

              <div className="reassurance-proof">
                <strong>Notre ambition est simple</strong>
                <small>
                  faciliter le travail des établissements et des équipes pédagogiques tout en leur
                  apportant la sérénité d’un partenaire capable de suivre leur projet de sa
                  conception jusqu’au retour des élèves.
                </small>
              </div>
            </div>

            <div className="reassurance-list">
              <article>
                <span>01</span>
                <div>
                  <h3>Un seul interlocuteur</h3>
                  <p>Du programme au transport, une même équipe suit votre projet de bout en bout.</p>
                </div>
              </article>

              <article>
                <span>02</span>
                <div>
                  <h3>Réactivité de terrain</h3>
                  <p>Moins d’intermédiaires, une communication fluide et une capacité à s’adapter rapidement.</p>
                </div>
              </article>

              <article>
                <span>03</span>
                <div>
                  <h3>Circuits courts</h3>
                  <p>Des décisions prises rapidement par une équipe qui connaît réellement le voyage.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="spotlight-section compact-spotlight-section">
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="section-head">
              <h2>La sécurité au cœur de notre métier</h2>
            </div>
            <p className="hero-text">
              Parce que transporter des enfants et des adolescents implique une responsabilité
              particulière, la sécurité constitue une priorité absolue.
            </p>
            <p className="hero-text">
              Les autocars Festimove disposent d’équipements modernes de sécurité et font l’objet
              d’un entretien préventif régulier. Nos conducteurs sont des professionnels
              expérimentés et les temps de conduite et de repos sont organisés dans le strict
              respect de la réglementation en vigueur.
            </p>
            <p className="hero-text">
              Cette expertise du transport constitue l’un des fondements de Scolamove : concevoir
              des voyages scolaires dans lesquels chaque étape est pensée avec exigence, de la
              préparation du séjour jusqu’au retour des élèves.
            </p>
          </div>
        </section>

        <section className="reassurance-section">
          <div className="container reassurance-grid">
            <div className="reassurance-main">
              <span>Conformité</span>
              <h2>Une entreprise agréée et assurée</h2>
              <p>
                Festimove dispose de l’ensemble des autorisations, licences et garanties
                nécessaires à l’exercice de ses activités de transport et de voyage.
              </p>
            </div>

            <div className="reassurance-list">
              <article>
                <span>—</span>
                <div>
                  <h3>Immatriculation agence de voyage</h3>
                  <p>IM092130023</p>
                </div>
              </article>
              <article>
                <span>—</span>
                <div>
                  <h3>Capacité transport</h3>
                  <p>EV 11 14 03251</p>
                </div>
              </article>
              <article>
                <span>—</span>
                <div>
                  <h3>Licence de Transport Intérieure</h3>
                  <p>2015/22/0000399</p>
                </div>
              </article>
              <article>
                <span>—</span>
                <div>
                  <h3>Licence de transport par autocars</h3>
                  <p>2015/22/0000398</p>
                </div>
              </article>
              <article>
                <span>—</span>
                <div>
                  <h3>Garantie financière</h3>
                  <p>APST</p>
                </div>
              </article>
              <article>
                <span>—</span>
                <div>
                  <h3>Responsabilité Civile Professionnelle</h3>
                  <p>Allianz</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="spotlight-section compact-spotlight-section">
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="section-head">
              <h2>Bien plus qu’un trajet : une expérience pensée pour les élèves</h2>
            </div>
            <p className="hero-text">
              Climatisation, fauteuils inclinables et décalables, prises USB et/ou 220 V,
              géolocalisation, rangements individuels, vidéo, réfrigérateur, toilettes, tables en
              carré : notre flotte est pensée pour rendre les déplacements collectifs aussi
              confortables que possible.
            </p>
            <p className="hero-text">
              Avec Scolamove, nous réunissons ainsi l’expertise du voyage, la connaissance du
              terrain et la maîtrise du transport au sein d’un même projet.
            </p>
            <p className="hero-text">
              Moins d’intermédiaires, plus de maîtrise, plus de réactivité et un accompagnement de
              bout en bout, avec une priorité : permettre aux enseignants et aux établissements de
              se concentrer sur l’essentiel — faire du voyage scolaire une expérience
              pédagogique, humaine et mémorable pour leurs élèves.
            </p>
          </div>
        </section>

        <section className="search-band">
          <div className="container" style={{ textAlign: "center" }}>
            <a href="/devis" className="btn btn-primary nav-cta">
              Demander un devis
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
