"use client";

import { useEffect, useState } from "react";
import TripCard from "@/components/TripCard";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

export default function TripsSection() {
  const [items, setItems] = useState<SupabaseSejour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSejours() {
      const { data, error } = await supabase
        .from("sejours")
        .select("*")
        .eq("hidden", false)
        .order("country", { ascending: true })
        .order("title", { ascending: true });

      if (!error && data) {
        setItems(data);
      }

      setLoading(false);
    }

    loadSejours();
  }, []);

  const featured = items.filter((sejour) => sejour.featured).slice(0, 6);
  const catalogue = items.filter((sejour) => !sejour.featured).slice(0, 9);

  if (loading) {
    return (
      <section id="sejours">
        <div className="container">
          <p>Chargement des séjours...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="sejours">
      <div className="container">
        <div className="section-head">
          <h2>Nos séjours phares.</h2>
          <p>Une sélection de voyages scolaires prêts à présenter à votre établissement.</p>
        </div>

        <div className="trip-grid">
          {featured.map((sejour) => (
            <TripCard key={sejour.id} sejour={sejour} />
          ))}
        </div>

        <div className="section-head section-head-secondary">
          <h2>Catalogue des séjours.</h2>
          <p>Tous les programmes peuvent être adaptés selon votre projet pédagogique.</p>
        </div>

        <div className="trip-grid">
          {catalogue.map((sejour) => (
            <TripCard key={sejour.id} sejour={sejour} />
          ))}
        </div>

        <div className="catalogue-more">
          <a href="/sejours" className="btn btn-primary">
            Voir tous nos séjours
          </a>
        </div>
      </div>
    </section>
  );
}