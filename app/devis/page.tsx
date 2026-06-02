"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

export default function DevisPage() {
  const searchParams = useSearchParams();
  const sejourSlug = searchParams.get("sejour");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSejour, setSelectedSejour] = useState<SupabaseSejour | null>(null);

  useEffect(() => {
    async function loadSejour() {
      if (!sejourSlug) return;

      const { data } = await supabase
        .from("sejours")
        .select("*")
        .eq("slug", sejourSlug)
        .single();

      if (data) {
        setSelectedSejour(data);
      }
    }

    loadSejour();
  }, [sejourSlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/devis", {
      method: "POST",
      body: JSON.stringify({
        schoolName: formData.get("schoolName"),
        teacherName: formData.get("teacherName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        departureCity: formData.get("departureCity"),
        destination: formData.get("destination"),
        period: formData.get("period"),
        level: formData.get("level"),
        studentsCount: formData.get("studentsCount"),
        message: formData.get("message"),
        sejourSlug: selectedSejour?.slug || null,
        sejourTitle: selectedSejour?.title || null,
        sejourDestination: selectedSejour?.destination || null,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Erreur pendant l’envoi.");
      setLoading(false);
      return;
    }

    form.reset();
    setStatus("Votre demande a bien été envoyée. Nous revenons vers vous rapidement.");
    setLoading(false);
  }

  return (
    <>
      <Header />

      <main className="quote-page">
        <section className="quote-hero">
          <div className="container">
            <span>Demande de devis</span>
            <h1>
              {selectedSejour
                ? `Demande de devis pour ${selectedSejour.title}`
                : "Construisons votre voyage scolaire."}
            </h1>
            <p>
              Renseignez les premières informations de votre projet. Un conseiller
              Scolamove vous recontacte avec une proposition claire et adaptée à
              votre établissement.
            </p>
          </div>
        </section>

        <section className="quote-section">
          <div className="container quote-layout">
            <form className="quote-form" onSubmit={submit}>
              {selectedSejour && (
                <div className="quote-selected-trip">
                  <img src={selectedSejour.image} alt="" />
                  <div>
                    <span>Séjour sélectionné</span>
                    <strong>{selectedSejour.title}</strong>
                    <small>
                      {selectedSejour.destination} · {selectedSejour.duration} ·{" "}
                      {selectedSejour.price}
                    </small>
                  </div>
                </div>
              )}

              <div className="quote-form-grid">
                <label>
                  Établissement
                  <input name="schoolName" placeholder="Ex : Collège Jean Moulin" />
                </label>

                <label>
                  Nom de l’enseignant *
                  <input name="teacherName" required placeholder="Votre nom" />
                </label>

                <label>
                  Email *
                  <input name="email" type="email" required placeholder="vous@etablissement.fr" />
                </label>

                <label>
                  Téléphone
                  <input name="phone" placeholder="06 00 00 00 00" />
                </label>

                <label>
                  Ville de départ
                  <input name="departureCity" placeholder="Ex : Lyon" />
                </label>

                <label>
                  Destination souhaitée
                  <input
                    name="destination"
                    defaultValue={selectedSejour?.destination || ""}
                    placeholder="Ex : Barcelone, Londres..."
                  />
                </label>

                <label>
                  Période
                  <input name="period" placeholder="Ex : avril 2026" />
                </label>

                <label>
                  Niveau
                  <select name="level" defaultValue={selectedSejour?.level || ""}>
                    <option value="">À préciser</option>
                    <option>École primaire</option>
                    <option>Collège</option>
                    <option>Lycée</option>
                    <option>Supérieur</option>
                  </select>
                </label>

                <label>
                  Nombre d’élèves
                  <input name="studentsCount" placeholder="Ex : 48" />
                </label>
              </div>

              <label>
                Votre projet
                <textarea
                  name="message"
                  placeholder="Décrivez votre projet, vos contraintes, vos objectifs pédagogiques, votre budget..."
                />
              </label>

              <button type="submit" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer ma demande"}
              </button>

              {status && <p className="quote-status">{status}</p>}
            </form>

            <aside className="quote-side">
              <h2>Ce que nous préparons pour vous</h2>
              <ul>
                <li>Une proposition adaptée au niveau des élèves</li>
                <li>Un programme clair pour l’établissement</li>
                <li>Une estimation du budget famille</li>
                <li>Une solution transport avec nos autocars</li>
                <li>Un accompagnement avant et pendant le séjour</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}