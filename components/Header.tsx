export default function Header() {
  return (
    <>
      <div className="top-offer">
        Offre établissements : recevez une proposition personnalisée sous 48h
      </div>

      <div className="contact-bar">
        <div className="contact-inner">
          <span>Agence spécialisée dans les voyages scolaires linguistiques</span>
          <span>
            <strong>Conseiller Scolamove :</strong> contact@scolamove.fr
          </span>
        </div>
      </div>

      <header>
  <div className="nav">
    <a className="logo logo-image" href="/" aria-label="Accueil Scolamove">
      <img src="/images/logo-scolamove.png" alt="Scolamove" />
    </a>

    <nav className="menu" aria-label="Navigation principale">
      <a href="/#sejours">Nos séjours</a>
      <a href="/#destinations">Destinations</a>
      <a href="/#agence">L’agence</a>
      <a href="/#process">Comment ça marche</a>
      <a href="/espace-enseignant" className="teacher-menu-button">
        Espace enseignant
      </a>
    </nav>

    <a href="/devis" className="btn btn-primary nav-cta">
      Demander un devis
    </a>

    <div className="mobile-header-actions">
      <a href="/devis">Demander un devis</a>
      <a href="/espace-enseignant">Espace enseignant</a>
    </div>
  </div>
</header>
    </>
  );
}
