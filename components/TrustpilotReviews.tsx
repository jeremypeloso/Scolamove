"use client";

import { useEffect } from "react";

export default function TrustpilotReviews() {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="trustpilot-section">
      <div className="container trustpilot-grid">
        <div className="trustpilot-copy">
          <span>Avis clients vérifiés</span>
          <h2>Des retours d’expérience pour rassurer vos équipes.</h2>
          <p>
            Les avis Trustpilot permettent aux enseignants et aux établissements
            de consulter des retours indépendants avant de construire leur projet
            de séjour scolaire.
          </p>
          <a
            href="https://fr.trustpilot.com/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Voir les avis Trustpilot
          </a>
        </div>

        <div className="trustpilot-widget-card">
          <div
            className="trustpilot-widget"
            data-locale="fr-FR"
            data-template-id="TON_TEMPLATE_ID"
            data-businessunit-id="TON_BUSINESSUNIT_ID"
            data-style-height="240px"
            data-style-width="100%"
            data-theme="light"
          >
            <a
              href="https://fr.trustpilot.com/"
              target="_blank"
              rel="noreferrer"
            >
              Trustpilot
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}