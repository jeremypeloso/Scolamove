"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import TripCard from "@/components/TripCard";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

function SejoursContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<SupabaseSejour[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("Tous");
  const [region, setRegion] = useState("Toutes");
  const [theme, setTheme] = useState("Tous");
  const [level, setLevel] = useState("Tous");

  const loadSejours = useCallback(async () => {
    setLoading(true);

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
  }, []);

  useEffect(() => {
  const q = searchParams.get("q");
  const levelParam = searchParams.get("level");
  const countryParam = searchParams.get("country");

  if (q) setQuery(q);
  if (levelParam) setLevel(levelParam);
  if (countryParam) setCountry(countryParam);
}, [searchParams]);

  useEffect(() => {
    loadSejours();

    function handlePageShow() {
      loadSejours();
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadSejours]);

  const countries = useMemo(
    () => ["Tous", ...Array.from(new Set(items.map((item) => item.country))).sort()],
    [items]
  );

  const regions = useMemo(
    () => ["Toutes", ...Array.from(new Set(items.map((item) => item.region))).sort()],
    [items]
  );

  const themes = useMemo(
    () => [
      "Tous",
      ...Array.from(
        new Set(items.map((item) => item.theme).filter(Boolean) as string[])
      ).sort(),
    ],
    [items]
  );

  const levels = useMemo(
    () => ["Tous", ...Array.from(new Set(items.map((item) => item.level))).sort()],
    [items]
  );

  const filteredItems = items.filter((item) => {
    const search = query.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(search) ||
      item.destination.toLowerCase().includes(search) ||
      item.country.toLowerCase().includes(search) ||
      item.region.toLowerCase().includes(search) ||
      item.language.toLowerCase().includes(search) ||
      (item.theme || "").toLowerCase().includes(search);

    return (
      matchesSearch &&
      (country === "Tous" || item.country === country) &&
      (region === "Toutes" || item.region === region) &&
      (theme === "Tous" || item.theme === theme) &&
      (level === "Tous" || item.level === level)
    );
  });

  function resetFilters() {
    setQuery("");
    setCountry("Tous");
    setRegion("Toutes");
    setTheme("Tous");
    setLevel("Tous");
  }

  return (
    <>
      <Header />

      <main>
        <section className="catalogue-hero">
          <div className="container">
            <span>Catalogue Scolamove</span>
            <h1>Tous nos séjours scolaires</h1>
            <p>
              Filtrez les voyages par pays, région, thème ou niveau scolaire
              pour trouver rapidement le programme adapté à votre établissement.
            </p>
          </div>
        </section>

        <section className="catalogue-page">
          <div className="container">
            <div className="catalogue-filters">
              <label>
                Rechercher
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Destination, pays, thème..."
                />
              </label>

              <label>
                Pays
                <select value={country} onChange={(event) => setCountry(event.target.value)}>
                  {countries.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>

              <label>
                Région
                <select value={region} onChange={(event) => setRegion(event.target.value)}>
                  {regions.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>

              <label>
                Thème
                <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                  {themes.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>

              <label>
                Niveau
                <select value={level} onChange={(event) => setLevel(event.target.value)}>
                  {levels.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>

              <button type="button" onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>

            <div className="catalogue-count">
              {loading
                ? "Chargement..."
                : `${filteredItems.length} séjour(s) trouvé(s)`}
            </div>

            {!loading && filteredItems.length === 0 && (
              <div className="empty-section">
                Aucun séjour ne correspond à votre recherche.
              </div>
            )}

            <div className="trip-grid catalogue-full-grid">
              {filteredItems.map((sejour) => (
                <TripCard key={sejour.id} sejour={sejour} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function SejoursPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <SejoursContent />
    </Suspense>
  );
}