"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

type Dossier = {
  id: string;
  dossier_reference: string | null;
  sejour_title: string;
  school_name: string;
  school_city: string | null;
  teacher_name: string;
  teacher_phone: string | null;
  start_date: string | null;
  end_date: string | null;
  student_count: number | null;
  chaperone_count: number | null;
  departure_place: string | null;
  departure_meeting_time: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  return_time: string | null;
  outbound_distance: string | null;
  outbound_duration: string | null;
  return_distance: string | null;
  return_duration: string | null;
  second_driver_relay: boolean;
  driver_rest_notes: string | null;
  coach_availability_notes: string | null;
  local_transport_notes: string | null;
  driver_meeting_points: string | null;
  driver_notes: string | null;
  operational_program: string | null;
  accommodation_name: string | null;
  accommodation_address: string | null;
  meals_details: string | null;
  sejour_snapshot: SupabaseSejour | null;
};

function formatDate(value: string | null) {
  if (!value) return "À préciser";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatMultiline(value: string | null) {
  if (!value) return null;

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ConducteurPrintPage() {
  const params = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDossier() {
      const { data, error } = await supabase
        .from("dossiers_etablissement")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setDossier(data as Dossier);
      }

      setLoading(false);
    }

    loadDossier();
  }, [params.id]);

  if (loading) {
    return <main className="print-page">Chargement fiche conducteur...</main>;
  }

  if (!dossier) {
    return (
      <main className="print-page">
        <h1>Fiche conducteur introuvable</h1>
      </main>
    );
  }

  const operationalLines = formatMultiline(dossier.operational_program);
  const meetingLines = formatMultiline(dossier.driver_meeting_points);

  return (
    <main className="print-page">
      <div className="print-actions">
        <a href="/admin/dossiers">Retour admin</a>
        <button type="button" onClick={() => window.print()}>
          Imprimer / PDF
        </button>
      </div>

      <section className="print-cover driver-cover">
        <div>
          <span>Fiche conducteur / transport</span>
          <h1>{dossier.sejour_title}</h1>
          <p>
            Référence : {dossier.dossier_reference || dossier.id}
          </p>
        </div>

        <div className="print-cover-card">
          <strong>{dossier.school_name}</strong>
          <span>{dossier.school_city || "Ville à préciser"}</span>
        </div>
      </section>

      <section className="print-section">
        <h2>Résumé du transport</h2>

        <div className="print-grid">
          <div>
            <span>Date de départ</span>
            <strong>{formatDate(dossier.start_date)}</strong>
          </div>

          <div>
            <span>Date de retour</span>
            <strong>{formatDate(dossier.end_date)}</strong>
          </div>

          <div>
            <span>Lieu de rendez-vous</span>
            <strong>{dossier.departure_place || "À préciser"}</strong>
          </div>

          <div>
            <span>Heure de rendez-vous</span>
            <strong>{dossier.departure_meeting_time || "À préciser"}</strong>
          </div>

          <div>
            <span>Heure de départ</span>
            <strong>{dossier.departure_time || "À préciser"}</strong>
          </div>

          <div>
            <span>Arrivée prévue</span>
            <strong>{dossier.arrival_time || "À préciser"}</strong>
          </div>

          <div>
            <span>Distance aller</span>
            <strong>{dossier.outbound_distance || "À préciser"}</strong>
          </div>

          <div>
            <span>Durée aller</span>
            <strong>{dossier.outbound_duration || "À préciser"}</strong>
          </div>

          <div>
            <span>Distance retour</span>
            <strong>{dossier.return_distance || "À préciser"}</strong>
          </div>

          <div>
            <span>Durée retour</span>
            <strong>{dossier.return_duration || "À préciser"}</strong>
          </div>

          <div>
            <span>Relais deuxième chauffeur</span>
            <strong>{dossier.second_driver_relay ? "Oui" : "Non"}</strong>
          </div>

          <div>
            <span>Participants</span>
            <strong>
              {dossier.student_count || "?"} élèves ·{" "}
              {dossier.chaperone_count || "?"} accompagnateurs
            </strong>
          </div>
        </div>
      </section>

      <section className="print-section">
        <h2>Contact groupe</h2>
        <p>
          <strong>Responsable :</strong> {dossier.teacher_name}
        </p>
        <p>
          <strong>Téléphone :</strong>{" "}
          {dossier.teacher_phone || "À préciser"}
        </p>
      </section>

      <section className="print-section">
        <h2>Hébergement et restauration</h2>

        <p>
          <strong>Hébergement :</strong>{" "}
          {dossier.accommodation_name || "À préciser"}
        </p>

        {dossier.accommodation_address && (
          <p>
            <strong>Adresse :</strong> {dossier.accommodation_address}
          </p>
        )}

        <p>
          <strong>Restauration :</strong>{" "}
          {dossier.meals_details || "À préciser"}
        </p>
      </section>

      <section className="print-section">
        <h2>Consignes conducteur</h2>

        <h3>Repos conducteur / immobilisation</h3>
        <p>{dossier.driver_rest_notes || "À préciser"}</p>

        <h3>Mise à disposition de l’autocar</h3>
        <p>{dossier.coach_availability_notes || "À préciser"}</p>

        <h3>Transports locaux</h3>
        <p>{dossier.local_transport_notes || "À préciser"}</p>
      </section>

      {meetingLines && (
        <section className="print-section">
          <h2>Points de rendez-vous conducteur</h2>
          <ul>
            {meetingLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {operationalLines && (
        <section className="print-section">
          <h2>Programme opérationnel</h2>
          <div className="print-timeline">
            {operationalLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      )}

      {dossier.driver_notes && (
        <section className="print-section">
          <h2>Notes complémentaires</h2>
          <p>{dossier.driver_notes}</p>
        </section>
      )}
    </main>
  );
}