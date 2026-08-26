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
        <section className="about-hero">
          <span>L’agence</span>
          <h1>Scolamove, l’expertise Festimove au service des voyages scolaires</h1>
          <p>
            Une marque de Festimove, entreprise de transport de voyageurs implantée dans l’Oise
            (60).
          </p>
        </section>

        <section className="about-content">
          <p>
            Depuis sa création, Festimove développe son activité autour d’engagements
            essentiels : la sécurité, la ponctualité, la proximité et la qualité de service.
            Forte d’une équipe de conducteurs professionnels expérimentés, d’une organisation
            rigoureuse et d’un parc d’autocars polyvalent, notre société accompagne particuliers,
            professionnels et collectivités dans leurs déplacements en France et à l’étranger.
          </p>
          <p>
            En tant que transporteur, nous accompagnons depuis de nombreuses années les groupes
            scolaires de nombreuses agences de voyages vers les principales destinations
            éducatives en France et en Europe. Cette expérience de terrain nous a permis de
            connaître les destinations, mais aussi d’observer concrètement toutes les étapes
            d’un voyage scolaire : sa préparation, le transport, les hébergements, les visites,
            le déroulement du programme sur place et les éventuels imprévus.
          </p>
          <p>
            <strong>C’est de cette expérience qu’est née Scolamove.</strong>
          </p>

          <h2>Du transport scolaire à l’organisation complète du voyage</h2>
          <p>
            Nous avons souhaité aller plus loin en proposant un modèle plus simple et plus
            direct : réduire le nombre d’interlocuteurs et d’intermédiaires pour maîtriser
            l’ensemble du processus, depuis la création du voyage et l’élaboration du programme
            jusqu’à son organisation sur place, en passant naturellement par le transport.
          </p>
          <p>
            L’objectif est également de tirer parti de notre expérience du terrain pour
            améliorer les points qui peuvent parfois montrer leurs limites dans le fonctionnement
            des agences traditionnelles : multiplication des intermédiaires, manque de
            réactivité, informations qui se perdent entre les différents prestataires ou encore
            difficulté à s’adapter rapidement lorsqu’un imprévu survient. Avec Scolamove, nous
            voulons au contraire privilégier des circuits de décision courts, une communication
            fluide et un interlocuteur qui connaît et maîtrise réellement le voyage dans son
            ensemble.
          </p>
          <p>
            Notre ambition est simple : faciliter le travail des établissements et des équipes
            pédagogiques tout en leur apportant la sérénité d’un partenaire capable de suivre
            leur projet de sa conception jusqu’au retour des élèves.
          </p>

          <h2>La sécurité au cœur de notre métier</h2>
          <p>
            Parce que transporter des enfants et des adolescents implique une responsabilité
            particulière, la sécurité constitue une priorité absolue. Les autocars Festimove
            disposent d’équipements modernes de sécurité et font l’objet d’un entretien préventif
            régulier. Nos conducteurs sont des professionnels expérimentés et les temps de
            conduite et de repos sont organisés dans le strict respect de la réglementation en
            vigueur.
          </p>
          <p>
            Cette expertise du transport constitue l’un des fondements de Scolamove : concevoir
            des voyages scolaires dans lesquels chaque étape est pensée avec exigence, de la
            préparation du séjour jusqu’au retour des élèves.
          </p>
        </section>

        <section className="about-licences">
          <h2>Une entreprise agréée et assurée</h2>
          <dl className="about-licences-grid">
            <dt>Immatriculation agence de voyage</dt>
            <dd>IM092130023</dd>
            <dt>Capacité transport</dt>
            <dd>EV 11 14 03251</dd>
            <dt>Licence de Transport Intérieure</dt>
            <dd>2015/22/0000399</dd>
            <dt>Licence de transport par autocars</dt>
            <dd>2015/22/0000398</dd>
            <dt>Garantie financière</dt>
            <dd>APST</dd>
            <dt>Responsabilité Civile Professionnelle</dt>
            <dd>Allianz</dd>
          </dl>
        </section>

        <section className="about-fleet">
          <h2>Bien plus qu’un trajet : une expérience pensée pour les élèves</h2>
          <div className="about-fleet-tags">
            <span>Climatisation</span>
            <span>Fauteuils inclinables et décalables</span>
            <span>Prises USB / 220V</span>
            <span>Géolocalisation</span>
            <span>Rangements individuels</span>
            <span>Vidéo</span>
            <span>Réfrigérateur</span>
            <span>Toilettes</span>
            <span>Tables en carré</span>
          </div>
          <p>
            Avec Scolamove, nous réunissons ainsi l’expertise du voyage, la connaissance du
            terrain et la maîtrise du transport au sein d’un même projet. Moins d’intermédiaires,
            plus de maîtrise, plus de réactivité et un accompagnement de bout en bout, avec une
            priorité : permettre aux enseignants et aux établissements de se concentrer sur
            l’essentiel — faire du voyage scolaire une expérience pédagogique, humaine et
            mémorable pour leurs élèves.
          </p>
        </section>

        <section className="about-cta">
          <a href="/devis" className="btn btn-primary nav-cta">
            Demander un devis
          </a>
        </section>
      </main>
    </>
  );
}
