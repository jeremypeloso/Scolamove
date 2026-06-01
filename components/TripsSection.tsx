"use client";

import { useCallback, useEffect, useState } from "react";
import TripCard from "@/components/TripCard";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

const CACHE_KEY = "scolamove-home-sejours-cache";

export default function TripsSection() {
  const [items, setItems] = useState<SupabaseSejour[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSejours = useCallback(async () => {
    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
      setItems(JSON.parse(cached));
      setLoading(false);
    }

    const { data, error } = await supabase
      .from("sejours")
      .select("*")
      .eq("hidden", false)
      .order("country", { ascending: true })
      .order("title", { ascending: true });

    if (!error && data) {
      setItems(data);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSejours();

    function handlePageShow() {
      setLoading(false);
      loadSejours();
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadSejours]);

  const featured = items.filter((sejour) => sejour.featured).slice(0, 6);
  const catalogue = items.filter((sejour) => !sejour.featured).slice(0, 9);

  if (loading && !items.length) {
    return null;
  }

  return (
    <section id="sejours">
      <div className="container">
        <div className="section-head">
          <h2>Nos séjours phares.</h2>
        </div>

        <div className="trip-grid">
          {featured.map((sejour) => (
            <TripCard key={sejour.id} sejour={sejour} />
          ))}
        </div>

        <div className="section-head section-head-secondary">
          <h2>Catalogue des séjours.</h2>
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