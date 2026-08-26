"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SejoursSearchBarProps = {
  initialQuery?: string;
  initialCountry?: string;
  initialRegion?: string;
  initialTheme?: string;
  initialLevel?: string;
};

export default function SejoursSearchBar({
  initialQuery = "",
  initialCountry = "Tous",
  initialRegion = "Toutes",
  initialTheme = "Tous",
  initialLevel = "Tous",
}: SejoursSearchBarProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [region, setRegion] = useState(initialRegion);
  const [theme, setTheme] = useState(initialTheme);
  const [level, setLevel] = useState(initialLevel);

  const [countries, setCountries] = useState<string[]>(["Tous"]);
  const [regions, setRegions] = useState<string[]>(["Toutes"]);
  const [themes, setThemes] = useState<string[]>(["Tous"]);
  const [levels, setLevels] = useState<string[]>(["Tous"]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("sejours")
        .select("country, region, theme, level")
        .eq("hidden", false);

      if (!error && data) {
        setCountries(["Tous", ...Array.from(new Set(data.map((d) => d.country))).sort()]);
        setRegions(["Toutes", ...Array.from(new Set(data.map((d) => d.region))).sort()]);
        setThemes([
          "Tous",
          ...Array.from(new Set(data.map((d) => d.theme).filter(Boolean) as string[])).sort(),
        ]);
        setLevels(["Tous", ...Array.from(new Set(data.map((d) => d.level))).sort()]);
      }
    })();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (country !== "Tous") params.set("country", country);
    if (region !== "Toutes") params.set("region", region);
    if (theme !== "Tous") params.set("theme", theme);
    if (level !== "Tous") params.set("level", level);
    router.push(`/sejours${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form className="agency-search" onSubmit={handleSubmit}>
      <label>
        <span>Rechercher</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Destination, pays, thème..."
        />
      </label>

      <label>
        <span>Pays</span>
        <select value={country} onChange={(event) => setCountry(event.target.value)}>
          {countries.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>

      <label>
        <span>Région</span>
        <select value={region} onChange={(event) => setRegion(event.target.value)}>
          {regions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>

      <label>
        <span>Thème</span>
        <select value={theme} onChange={(event) => setTheme(event.target.value)}>
          {themes.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>

      <label>
        <span>Niveau</span>
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          {levels.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>

      <button type="submit">Rechercher</button>
    </form>
  );
}
