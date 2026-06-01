"use client";

import { FormEvent, useState } from "react";

export default function QuoteForm() {
  const [destination, setDestination] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [period, setPeriod] = useState("");
  const [level, setLevel] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (destination.trim()) {
      params.set("q", destination.trim());
    }

    if (departureCity.trim()) {
      params.set("departure", departureCity.trim());
    }

    if (period.trim()) {
      params.set("period", period.trim());
    }

    if (level.trim()) {
      params.set("level", level.trim());
    }

    window.location.href = `/sejours?${params.toString()}`;
  }

  return (
    <form className="agency-search" onSubmit={handleSubmit}>
      <label>
        <span>Destination</span>
        <input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="Pays, ville, thème..."
        />
      </label>

      <label>
        <span>Ville de départ</span>
        <input
          value={departureCity}
          onChange={(event) => setDepartureCity(event.target.value)}
          placeholder="Ex : Paris"
        />
      </label>

      <label>
        <span>Période</span>
        <input
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          placeholder="Ex : avril 2026"
        />
      </label>

      <label>
        <span>Niveau</span>
        <select value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="">Tous</option>
          <option value="Primaire">Primaire</option>
          <option value="Collège">Collège</option>
          <option value="Lycée">Lycée</option>
          <option value="Supérieur">Supérieur</option>
        </select>
      </label>

      <button type="submit">Rechercher</button>
    </form>
  );
}