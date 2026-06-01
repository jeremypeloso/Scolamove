"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

type ProgramItem = {
  day: string;
  title: string;
  text: string;
};

type Dossier = {
  id: string;
  sejour_title: string;
  school_name: string;
  school_city: string | null;
  teacher_name: string;
  teacher_email: string | null;
  teacher_phone: string | null;
  start_date: string | null;
  end_date: string | null;
  student_count: number | null;
  chaperone_count: number | null;
  departure_place: string | null;
  departure_time: string | null;
  return_time: string | null;
  transport_details: string | null;
  accommodation_name: string | null;
  accommodation_address: string | null;
  meals_details: string | null;
  price_per_student: string | null;
  included_services: string | null;
  optional_services: string | null;
  safety_notes: string | null;
  family_notes: string | null;
  status: string;
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

function splitText(value: string | null) {
  return (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function DossierPrintPage() {
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

  const sejour = dossier?.sejour_snapshot;

  const program = useMemo(() => {
    if (!sejour?.program) return [];
    return sejour.program as ProgramItem[];
  }, [sejour]);

  if (loading) {
    return <main className="print-page">Chargement du dossier...</main>;
  }

  if (!dossier || !sejour) {
    return (
      <main className="print-page">
        <h1>Dossier introuvable</h1>
        <p>Ce dossier n’existe pas ou n’est plus disponible.</p>
      </main>
    );
  }

  return (
    <main className="print-page">
      <div className="print-actions">
        <a href="/admin/dossiers">Retour admin</a>
        <button type="button" onClick={() => window.print()}>
          Imprimer / PDF
        </button>
      </div>

      <section className="print-cover">
        <div>
          <span>Dossier établissement</span>
          <h1>{dossier.sejour_title}</h1>
          <p>{sejour.destination} · {sejour.country}</p>
        </div>

        <div className="print-cover-card">
          <strong>{dossier.school_name}</strong>
          <span>{dossier.school_city || "Ville à préciser"}</span>
        </div>
      </section>

      <section className="print-section">
        <h2>Informations générales</h2>

        <div className="print-grid">
          <div>
            <span>Établissement</span>
            <strong>{dossier.school_name}</strong>
          </div>

          <div>
            <span>Responsable</span>
            <strong>{dossier.teacher_name}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{dossier.teacher_email || "À préciser"}</strong>
          </div>

          <div>
            <span>Téléphone</span>
            <strong>{dossier.teacher_phone || "À préciser"}</strong>
          </div>

          <div>
            <span>Dates</span>
            <strong>
              {formatDate(dossier.start_date)} → {formatDate(dossier.end_date)}
            </strong>
          </div>

          <div>
            <span>Participants</span>
            <strong>
              {dossier.student_count || "?"} élèves ·{" "}
              {dossier.chaperone_count || "?"} accompagnateurs
            </strong>
          </div>

          <div>
            <span>Départ</span>
            <strong>{dossier.departure_place || "À préciser"}</strong>
          </div>

          <div>
            <span>Horaires</span>
            <strong>
              Départ {dossier.departure_time || "?"} · Retour{" "}
              {dossier.return_time || "?"}
            </strong>
          </div>
        </div>
      </section>

      <section className="print-section">
        <h2>Présentation du projet</h2>
        <p>{sejour.description}</p>
      </section>

      <section className="print-section">
        <h2>Objectifs pédagogiques</h2>

        <ul>
          {(sejour.objectives || []).map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>

      <section className="print-section">
        <h2>Programme prévisionnel</h2>

        <div className="print-program">
          {program.map((item) => (
            <article key={`${item.day}-${item.title}`}>
              <span>{item.day}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="print-section">
        <h2>Transport</h2>
        <p>{dossier.transport_details || sejour.transport}</p>
      </section>

      <section className="print-section">
        <h2>Hébergement et restauration</h2>

        <p>
          <strong>Hébergement :</strong>{" "}
          {dossier.accommodation_name || sejour.accommodation}
        </p>

        {dossier.accommodation_address && (
          <p>
            <strong>Adresse :</strong> {dossier.accommodation_address}
          </p>
        )}

        <p>
          <strong>Restauration :</strong>{" "}
          {dossier.meals_details || "À préciser selon programme."}
        </p>
      </section>

      <section className="print-section">
        <h2>Budget et prestations</h2>

        <p>
          <strong>Prix par élève :</strong>{" "}
          {dossier.price_per_student || sejour.price}
        </p>

        <h3>Prestations incluses</h3>
        <ul>
          {splitText(dossier.included_services).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {dossier.optional_services && (
          <>
            <h3>Options ou prestations non incluses</h3>
            <ul>
              {splitText(dossier.optional_services).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="print-section">
        <h2>Sécurité et assistance</h2>
        <p>{dossier.safety_notes}</p>
      </section>

      <section className="print-section">
        <h2>Informations familles</h2>
        <p>{dossier.family_notes}</p>
      </section>
    </main>
  );
}