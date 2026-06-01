"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  joinLines,
  programToText,
  splitLines,
  textToProgram,
  type SupabaseSejour,
} from "@/lib/sejours-supabase";

const ADMIN_PASSWORD = "scola2026";

type AdminTab = "dashboard" | "sejours" | "settings";

function buildInitialForm(sejour: SupabaseSejour) {
  return {
    slug: sejour.slug,
    title: sejour.title,
    destination: sejour.destination,
    country: sejour.country,
    region: sejour.region,
    language: sejour.language,
    duration: sejour.duration,
    level: sejour.level,
    accommodation: sejour.accommodation,
    transport: sejour.transport,
    price: sejour.price,
    image: sejour.image,
    badge: sejour.badge || "",
    featured: Boolean(sejour.featured),
    hidden: Boolean(sejour.hidden),
    theme: sejour.theme || "",
    description: sejour.description || "",
    objectivesText: joinLines(sejour.objectives),
    programText: programToText(sejour.program),
    visitBudget: sejour.visit_budget || "",
    possibleVisits: sejour.possible_visits || "",
  };
}

export default function AdminPage() {
  const [isLogged, setIsLogged] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sejours, setSejours] = useState<SupabaseSejour[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("Tous");
  const [form, setForm] = useState<ReturnType<typeof buildInitialForm> | null>(
    null
  );
  const [saveStatus, setSaveStatus] = useState("");

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setIsLogged(localStorage.getItem("scolamove-admin") === "true");
  }, []);

  useEffect(() => {
    if (isLogged) {
      loadSejours();
    }
  }, [isLogged]);

  async function loadSejours() {
    const { data, error } = await supabase
      .from("sejours")
      .select("*")
      .order("country", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      setSaveStatus(`Erreur chargement : ${error.message}`);
      return;
    }

    const rows = data || [];
    setSejours(rows);

    if (!selectedId && rows[0]) {
      setSelectedId(rows[0].id);
      setForm(buildInitialForm(rows[0]));
    }
  }

  const selectedSejour =
    sejours.find((sejour) => sejour.id === selectedId) || sejours[0];

  useEffect(() => {
    if (selectedSejour) {
      setForm(buildInitialForm(selectedSejour));
      setSaveStatus("");
    }
  }, [selectedSejour?.id]);

  const visibleSejours = sejours.filter((sejour) => !sejour.hidden);
  const featuredSejours = sejours.filter(
    (sejour) => sejour.featured && !sejour.hidden
  );

  const countries = useMemo(() => {
    return [
      "Tous",
      ...Array.from(new Set(sejours.map((sejour) => sejour.country))).sort(),
    ];
  }, [sejours]);

  const filteredSejours = sejours.filter((sejour) => {
    const query = search.toLowerCase();

    const matchesCountry =
      countryFilter === "Tous" || sejour.country === countryFilter;

    const matchesSearch =
      sejour.title.toLowerCase().includes(query) ||
      sejour.destination.toLowerCase().includes(query) ||
      sejour.region.toLowerCase().includes(query) ||
      sejour.country.toLowerCase().includes(query);

    return matchesCountry && matchesSearch;
  });

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("scolamove-admin", "true");
      setIsLogged(true);
      setLoginError("");
      return;
    }

    setLoginError("Mot de passe incorrect.");
  }

  function handleLogout() {
    localStorage.removeItem("scolamove-admin");
    setIsLogged(false);
  }

  function updateForm(field: string, value: string | boolean) {
    if (!form) return;

    setForm({
      ...form,
      [field]: value,
    });
  }

  async function saveCurrentSejour(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSejour || !form) return;

    setSaveStatus("Enregistrement en cours...");

    const { error } = await supabase
      .from("sejours")
      .update({
        slug: form.slug.trim(),
        title: form.title.trim(),
        destination: form.destination.trim(),
        country: form.country.trim(),
        region: form.region.trim(),
        language: form.language.trim(),
        duration: form.duration.trim(),
        level: form.level.trim(),
        accommodation: form.accommodation.trim(),
        transport: form.transport.trim(),
        price: form.price.trim(),
        image: form.image.trim(),
        badge: form.badge.trim() || null,
        featured: form.featured,
        hidden: form.hidden,
        theme: form.theme.trim() || null,
        description: form.description.trim() || null,
        objectives: splitLines(form.objectivesText),
        program: textToProgram(form.programText),
        visit_budget: form.visitBudget.trim() || null,
        possible_visits: form.possibleVisits.trim() || null,
      })
      .eq("id", selectedSejour.id);

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSaveStatus("Modifications enregistrées.");
    await loadSejours();
  }

  async function uploadImage(file: File) {
  if (!form || !selectedSejour) return;

  setUploading(true);
  setSaveStatus("Upload de l’image en cours...");

  const extension = file.name.split(".").pop();
  const filePath = `${selectedSejour.slug}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("sejours")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    setUploading(false);
    setSaveStatus(`Erreur upload : ${error.message}`);
    return;
  }

  const { data } = supabase.storage.from("sejours").getPublicUrl(filePath);

  setForm({
    ...form,
    image: data.publicUrl,
  });

  setUploading(false);
  setSaveStatus(
    "Image envoyée. Clique maintenant sur Enregistrer les modifications."
  );
}

  if (!isLogged) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <a href="/" className="admin-back">
            Retour au site
          </a>

          <h1>Admin Scolamove</h1>
          <p>Connecte-toi pour modifier les fiches voyages du site.</p>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe admin"
            />
          </label>

          <button type="submit">Se connecter</button>

          {loginError && <span className="admin-error">{loginError}</span>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Scolamove
          <span>Dashboard admin</span>
        </div>

        <nav className="admin-menu">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Tableau de bord
          </button>

          <button
            className={activeTab === "sejours" ? "active" : ""}
            onClick={() => setActiveTab("sejours")}
          >
            Fiches voyages
          </button>

          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Réglages
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Se déconnecter
        </button>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <span>Administration</span>
            <h1>
              {activeTab === "dashboard" && "Tableau de bord"}
              {activeTab === "sejours" && "Fiches voyages"}
              {activeTab === "settings" && "Réglages"}
            </h1>
          </div>

          <a href="/" target="_blank">
            Voir le site
          </a>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="admin-grid">
              <article className="admin-stat">
                <span>Fiches catalogue</span>
                <strong>{sejours.length}</strong>
              </article>

              <article className="admin-stat">
                <span>Fiches visibles</span>
                <strong>{visibleSejours.length}</strong>
              </article>

              <article className="admin-stat">
                <span>Séjours phares</span>
                <strong>{featuredSejours.length}</strong>
              </article>
            </div>

            <div className="admin-panel">
              <h2>Gestion Supabase active</h2>
              <p>
                Les fiches voyages sont maintenant lues et modifiées depuis
                Supabase. Les changements enregistrés ici sont visibles sur le
                site public.
              </p>
            </div>
          </>
        )}

        {activeTab === "sejours" && selectedSejour && form && (
          <div className="admin-sejours-layout">
            <aside className="admin-panel admin-sejours-list-panel">
              <div className="admin-list-head">
                <h2>Catalogue</h2>

                <select
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un séjour..."
                />
              </div>

              <div className="admin-sejours-list">
                {filteredSejours.map((sejour) => (
                  <button
                    key={sejour.id}
                    className={
                      sejour.id === selectedSejour.id
                        ? "admin-sejour-row active"
                        : "admin-sejour-row"
                    }
                    onClick={() => setSelectedId(sejour.id)}
                  >
                    <img src={sejour.image} alt="" />

                    <span>
                      <strong>{sejour.title}</strong>
                      <small>
                        {sejour.country} · {sejour.region} · {sejour.price}
                      </small>
                    </span>

                    {sejour.featured && <em>Phare</em>}
                    {sejour.hidden && <em>Masqué</em>}
                  </button>
                ))}
              </div>
            </aside>

            <form className="admin-panel admin-form" onSubmit={saveCurrentSejour}>
              <div className="admin-edit-head">
                <div>
                  <span>Fiche sélectionnée</span>
                  <h2>{selectedSejour.title}</h2>
                </div>

                <a href={`/sejours/${selectedSejour.slug}`} target="_blank">
                  Voir la fiche
                </a>
              </div>

              <div className="admin-preview-card">
                <img src={form.image} alt="" />

                <div>
                  {form.badge && <em>{form.badge}</em>}
                  <strong>{form.title}</strong>
                  <span>
                    {form.destination} · {form.duration}
                  </span>
                </div>
              </div>

              <div className="admin-form-grid two">
                <label>
                  Slug URL
                  <input
                    value={form.slug}
                    onChange={(event) => updateForm("slug", event.target.value)}
                  />
                </label>

                <label>
                  Titre
                  <input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                  />
                </label>

                <label>
                  Destination
                  <input
                    value={form.destination}
                    onChange={(event) =>
                      updateForm("destination", event.target.value)
                    }
                  />
                </label>

                <label>
                  Pays
                  <input
                    value={form.country}
                    onChange={(event) =>
                      updateForm("country", event.target.value)
                    }
                  />
                </label>

                <label>
                  Région
                  <input
                    value={form.region}
                    onChange={(event) => updateForm("region", event.target.value)}
                  />
                </label>

                <label>
                  Thème / langue
                  <input
                    value={form.language}
                    onChange={(event) =>
                      updateForm("language", event.target.value)
                    }
                  />
                </label>

                <label>
                  Catégorie
                  <input
                    value={form.theme}
                    onChange={(event) => updateForm("theme", event.target.value)}
                  />
                </label>

                <label>
                  Durée
                  <input
                    value={form.duration}
                    onChange={(event) =>
                      updateForm("duration", event.target.value)
                    }
                  />
                </label>

                <label>
                  Niveau scolaire
                  <input
                    value={form.level}
                    onChange={(event) => updateForm("level", event.target.value)}
                  />
                </label>

                <label>
                  Hébergement
                  <input
                    value={form.accommodation}
                    onChange={(event) =>
                      updateForm("accommodation", event.target.value)
                    }
                  />
                </label>

                <label>
                  Transport
                  <input
                    value={form.transport}
                    onChange={(event) =>
                      updateForm("transport", event.target.value)
                    }
                  />
                </label>

                <label>
                  Prix
                  <input
                    value={form.price}
                    onChange={(event) => updateForm("price", event.target.value)}
                  />
                </label>

                <label>
                  Badge optionnel
                  <input
                    value={form.badge}
                    onChange={(event) => updateForm("badge", event.target.value)}
                    placeholder="Ex : Nouveauté, Best-seller..."
                  />
                </label>
              </div>

              <div className="admin-image-field">
  <label>
    Image actuelle
    <input
      value={form.image}
      onChange={(event) => updateForm("image", event.target.value)}
      placeholder="L’URL sera remplie automatiquement après l’upload"
    />
  </label>

  <label className="admin-upload-box">
    <span>Télécharger une nouvelle image</span>
    <strong>{uploading ? "Upload en cours..." : "Choisir une image"}</strong>
    <input
      type="file"
      accept="image/*"
      disabled={uploading}
      onChange={(event) => {
        const file = event.target.files?.[0];

        if (file) {
          uploadImage(file);
        }
      }}
    />
  </label>

  <p>
    Après avoir choisi une image, clique sur{" "}
    <strong>Enregistrer les modifications</strong> pour la publier.
  </p>
</div>

              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                />
              </label>

              <label>
                Objectifs pédagogiques
                <textarea
                  value={form.objectivesText}
                  onChange={(event) =>
                    updateForm("objectivesText", event.target.value)
                  }
                  placeholder="Un objectif par ligne"
                />
              </label>

              <label>
                Programme jour par jour
                <textarea
                  className="admin-program-textarea"
                  value={form.programText}
                  onChange={(event) =>
                    updateForm("programText", event.target.value)
                  }
                  placeholder={
                    "Jour 1 | Titre de la journée | Texte du programme\nJour 2 | Titre de la journée | Texte du programme"
                  }
                />
              </label>

              <label>
                Budget visites
                <input
                  value={form.visitBudget}
                  onChange={(event) =>
                    updateForm("visitBudget", event.target.value)
                  }
                />
              </label>

              <label>
                Autres visites possibles
                <textarea
                  value={form.possibleVisits}
                  onChange={(event) =>
                    updateForm("possibleVisits", event.target.value)
                  }
                />
              </label>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateForm("featured", event.target.checked)
                    }
                  />
                  Afficher dans Nos séjours phares
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={form.hidden}
                    onChange={(event) =>
                      updateForm("hidden", event.target.checked)
                    }
                  />
                  Masquer cette fiche du site
                </label>
              </div>

              <div className="admin-editor-actions">
                <button type="submit">Enregistrer les modifications</button>
              </div>

              {saveStatus && <p className="admin-save-status">{saveStatus}</p>}
            </form>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="admin-panel">
            <h2>Supabase</h2>
            <p>
              Le dashboard est maintenant connecté à Supabase. Prochaine étape :
              ajouter l’upload d’images directement dans le bucket
              <strong> sejours</strong>.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}