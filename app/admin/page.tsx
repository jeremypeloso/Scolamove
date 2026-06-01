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

type AdminTab = "dashboard" | "highlights" | "sejours" | "settings";

type Highlight = {
  id: string;
  title: string;
  image: string;
  link: string | null;
  position: number;
  active: boolean;
};

function buildInitialSejourForm(sejour: SupabaseSejour) {
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

function buildEmptyHighlight() {
  return {
    title: "",
    image: "",
    link: "",
    position: 0,
    active: true,
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
  const [sejourForm, setSejourForm] =
    useState<ReturnType<typeof buildInitialSejourForm> | null>(null);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState("");
  const [highlightForm, setHighlightForm] = useState(buildEmptyHighlight());

  const [saveStatus, setSaveStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setIsLogged(localStorage.getItem("scolamove-admin") === "true");
  }, []);

  useEffect(() => {
    if (isLogged) {
      loadSejours();
      loadHighlights();
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
      setSejourForm(buildInitialSejourForm(rows[0]));
    }
  }

  async function loadHighlights() {
    const { data, error } = await supabase
      .from("highlights")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setSaveStatus(`Erreur highlights : ${error.message}`);
      return;
    }

    const rows = (data || []) as Highlight[];
    setHighlights(rows);

    if (!selectedHighlightId && rows[0]) {
      setSelectedHighlightId(rows[0].id);
      setHighlightForm({
        title: rows[0].title,
        image: rows[0].image,
        link: rows[0].link || "",
        position: rows[0].position,
        active: rows[0].active,
      });
    }
  }

  const selectedSejour =
    sejours.find((sejour) => sejour.id === selectedId) || sejours[0];

  const selectedHighlight =
    highlights.find((highlight) => highlight.id === selectedHighlightId) ||
    null;

  useEffect(() => {
    if (selectedSejour) {
      setSejourForm(buildInitialSejourForm(selectedSejour));
      setSaveStatus("");
    }
  }, [selectedSejour?.id]);

  useEffect(() => {
    if (selectedHighlight) {
      setHighlightForm({
        title: selectedHighlight.title,
        image: selectedHighlight.image,
        link: selectedHighlight.link || "",
        position: selectedHighlight.position,
        active: selectedHighlight.active,
      });
      setSaveStatus("");
    }
  }, [selectedHighlight?.id]);

  const visibleSejours = sejours.filter((sejour) => !sejour.hidden);
  const featuredSejours = sejours.filter(
    (sejour) => sejour.featured && !sejour.hidden
  );
  const activeHighlights = highlights.filter((highlight) => highlight.active);

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

  function updateSejourForm(field: string, value: string | boolean) {
    if (!sejourForm) return;

    setSejourForm({
      ...sejourForm,
      [field]: value,
    });
  }

  function updateHighlightForm(field: string, value: string | number | boolean) {
    setHighlightForm({
      ...highlightForm,
      [field]: value,
    });
  }

  async function saveCurrentSejour(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSejour || !sejourForm) return;

    setSaveStatus("Enregistrement en cours...");

    const { error } = await supabase
      .from("sejours")
      .update({
        slug: sejourForm.slug.trim(),
        title: sejourForm.title.trim(),
        destination: sejourForm.destination.trim(),
        country: sejourForm.country.trim(),
        region: sejourForm.region.trim(),
        language: sejourForm.language.trim(),
        duration: sejourForm.duration.trim(),
        level: sejourForm.level.trim(),
        accommodation: sejourForm.accommodation.trim(),
        transport: sejourForm.transport.trim(),
        price: sejourForm.price.trim(),
        image: sejourForm.image.trim(),
        badge: sejourForm.badge.trim() || null,
        featured: sejourForm.featured,
        hidden: sejourForm.hidden,
        theme: sejourForm.theme.trim() || null,
        description: sejourForm.description.trim() || null,
        objectives: splitLines(sejourForm.objectivesText),
        program: textToProgram(sejourForm.programText),
        visit_budget: sejourForm.visitBudget.trim() || null,
        possible_visits: sejourForm.possibleVisits.trim() || null,
      })
      .eq("id", selectedSejour.id);

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSaveStatus("Modifications enregistrées.");
    await loadSejours();
  }

  async function saveHighlight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaveStatus("Enregistrement en cours...");

    const payload = {
      title: highlightForm.title.trim(),
      image: highlightForm.image.trim(),
      link: highlightForm.link.trim() || null,
      position: Number(highlightForm.position) || 0,
      active: Boolean(highlightForm.active),
    };

    if (selectedHighlight) {
      const { error } = await supabase
        .from("highlights")
        .update(payload)
        .eq("id", selectedHighlight.id);

      if (error) {
        setSaveStatus(`Erreur : ${error.message}`);
        return;
      }

      setSaveStatus("Carte modifiée.");
      await loadHighlights();
      return;
    }

    const { data, error } = await supabase
      .from("highlights")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedHighlightId(data.id);
    setSaveStatus("Carte ajoutée.");
    await loadHighlights();
  }

  async function deleteHighlight() {
    if (!selectedHighlight) return;

    const confirmation = window.confirm("Supprimer cette carte ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("highlights")
      .delete()
      .eq("id", selectedHighlight.id);

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedHighlightId("");
    setHighlightForm(buildEmptyHighlight());
    setSaveStatus("Carte supprimée.");
    await loadHighlights();
  }

  function createNewHighlight() {
    setSelectedHighlightId("");
    setHighlightForm(buildEmptyHighlight());
    setSaveStatus("");
  }

  async function uploadImage(file: File, target: "sejour" | "highlight") {
    setUploading(true);
    setSaveStatus("Upload de l’image en cours...");

    const extension = file.name.split(".").pop();
    const baseName =
      target === "sejour"
        ? selectedSejour?.slug || "sejour"
        : selectedHighlight?.id || "highlight";

    const filePath = `${target}-${baseName}-${Date.now()}.${extension}`;

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

    if (target === "sejour" && sejourForm) {
      setSejourForm({
        ...sejourForm,
        image: data.publicUrl,
      });
    }

    if (target === "highlight") {
      setHighlightForm({
        ...highlightForm,
        image: data.publicUrl,
      });
    }

    setUploading(false);
    setSaveStatus(
      "Image envoyée. Clique maintenant sur Enregistrer pour la publier."
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
            className={activeTab === "highlights" ? "active" : ""}
            onClick={() => setActiveTab("highlights")}
          >
            À ne pas manquer
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
              {activeTab === "highlights" && "À ne pas manquer"}
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
                <span>À ne pas manquer</span>
                <strong>{activeHighlights.length}</strong>
              </article>
            </div>

            <div className="admin-panel">
              <h2>Gestion Supabase active</h2>
              <p>
                Les fiches voyages et les cartes “À ne pas manquer” sont
                maintenant lues et modifiées depuis Supabase.
              </p>
            </div>
          </>
        )}

        {activeTab === "highlights" && (
          <div className="admin-sejours-layout">
            <aside className="admin-panel admin-sejours-list-panel">
              <div className="admin-list-head">
                <h2>Cartes</h2>
                <button type="button" onClick={createNewHighlight}>
                  Nouvelle carte
                </button>
              </div>

              <div className="admin-highlight-list">
                {highlights.map((highlight) => (
                  <button
                    key={highlight.id}
                    type="button"
                    className={
                      highlight.id === selectedHighlightId
                        ? "admin-highlight-row active"
                        : "admin-highlight-row"
                    }
                    onClick={() => setSelectedHighlightId(highlight.id)}
                  >
                    <img src={highlight.image} alt="" />
                    <span>
                      <strong>{highlight.title}</strong>
                      <small>
                        Ordre {highlight.position} ·{" "}
                        {highlight.active ? "Actif" : "Masqué"}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <form className="admin-panel admin-form" onSubmit={saveHighlight}>
              <div className="admin-edit-head">
                <div>
                  <span>Carte sélectionnée</span>
                  <h2>{selectedHighlight ? "Modifier la carte" : "Nouvelle carte"}</h2>
                </div>
              </div>

              <div className="admin-preview-card">
                {highlightForm.image ? (
                  <img src={highlightForm.image} alt="" />
                ) : (
                  <div className="admin-empty-image">Image</div>
                )}

                <div>
                  <strong>{highlightForm.title || "Titre de la carte"}</strong>
                  <span>{highlightForm.link || "Lien non renseigné"}</span>
                </div>
              </div>

              <label>
                Titre
                <input
                  value={highlightForm.title}
                  onChange={(event) =>
                    updateHighlightForm("title", event.target.value)
                  }
                  placeholder="Ex : Circuits en Asie"
                />
              </label>

              <div className="admin-image-field">
                <label>
                  Image actuelle
                  <input
                    value={highlightForm.image}
                    onChange={(event) =>
                      updateHighlightForm("image", event.target.value)
                    }
                    placeholder="L’URL sera remplie automatiquement après l’upload"
                  />
                </label>

                <label className="admin-upload-box">
                  <span>Télécharger une nouvelle image</span>
                  <strong>
                    {uploading ? "Upload en cours..." : "Choisir une image"}
                  </strong>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(file, "highlight");
                    }}
                  />
                </label>
              </div>

              <label>
                Lien
                <input
                  value={highlightForm.link}
                  onChange={(event) =>
                    updateHighlightForm("link", event.target.value)
                  }
                  placeholder="/sejours ou https://..."
                />
              </label>

              <label>
                Ordre d’affichage
                <input
                  type="number"
                  value={highlightForm.position}
                  onChange={(event) =>
                    updateHighlightForm("position", Number(event.target.value))
                  }
                />
              </label>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={highlightForm.active}
                    onChange={(event) =>
                      updateHighlightForm("active", event.target.checked)
                    }
                  />
                  Afficher cette carte sur le site
                </label>
              </div>

              <div className="admin-editor-actions">
                <button type="submit">
                  {selectedHighlight ? "Enregistrer" : "Ajouter la carte"}
                </button>

                {selectedHighlight && (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={deleteHighlight}
                  >
                    Supprimer
                  </button>
                )}
              </div>

              {saveStatus && <p className="admin-save-status">{saveStatus}</p>}
            </form>
          </div>
        )}

        {activeTab === "sejours" && selectedSejour && sejourForm && (
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
                <img src={sejourForm.image} alt="" />

                <div>
                  {sejourForm.badge && <em>{sejourForm.badge}</em>}
                  <strong>{sejourForm.title}</strong>
                  <span>
                    {sejourForm.destination} · {sejourForm.duration}
                  </span>
                </div>
              </div>

              <div className="admin-form-grid two">
                <label>
                  Slug URL
                  <input
                    value={sejourForm.slug}
                    onChange={(event) =>
                      updateSejourForm("slug", event.target.value)
                    }
                  />
                </label>

                <label>
                  Titre
                  <input
                    value={sejourForm.title}
                    onChange={(event) =>
                      updateSejourForm("title", event.target.value)
                    }
                  />
                </label>

                <label>
                  Destination
                  <input
                    value={sejourForm.destination}
                    onChange={(event) =>
                      updateSejourForm("destination", event.target.value)
                    }
                  />
                </label>

                <label>
                  Pays
                  <input
                    value={sejourForm.country}
                    onChange={(event) =>
                      updateSejourForm("country", event.target.value)
                    }
                  />
                </label>

                <label>
                  Région
                  <input
                    value={sejourForm.region}
                    onChange={(event) =>
                      updateSejourForm("region", event.target.value)
                    }
                  />
                </label>

                <label>
                  Thème / langue
                  <input
                    value={sejourForm.language}
                    onChange={(event) =>
                      updateSejourForm("language", event.target.value)
                    }
                  />
                </label>

                <label>
                  Catégorie
                  <input
                    value={sejourForm.theme}
                    onChange={(event) =>
                      updateSejourForm("theme", event.target.value)
                    }
                  />
                </label>

                <label>
                  Durée
                  <input
                    value={sejourForm.duration}
                    onChange={(event) =>
                      updateSejourForm("duration", event.target.value)
                    }
                  />
                </label>

                <label>
                  Niveau scolaire
                  <input
                    value={sejourForm.level}
                    onChange={(event) =>
                      updateSejourForm("level", event.target.value)
                    }
                  />
                </label>

                <label>
                  Hébergement
                  <input
                    value={sejourForm.accommodation}
                    onChange={(event) =>
                      updateSejourForm("accommodation", event.target.value)
                    }
                  />
                </label>

                <label>
                  Transport
                  <input
                    value={sejourForm.transport}
                    onChange={(event) =>
                      updateSejourForm("transport", event.target.value)
                    }
                  />
                </label>

                <label>
                  Prix
                  <input
                    value={sejourForm.price}
                    onChange={(event) =>
                      updateSejourForm("price", event.target.value)
                    }
                  />
                </label>

                <label>
                  Badge optionnel
                  <input
                    value={sejourForm.badge}
                    onChange={(event) =>
                      updateSejourForm("badge", event.target.value)
                    }
                    placeholder="Ex : Nouveauté, Best-seller..."
                  />
                </label>
              </div>

              <div className="admin-image-field">
                <label>
                  Image actuelle
                  <input
                    value={sejourForm.image}
                    onChange={(event) =>
                      updateSejourForm("image", event.target.value)
                    }
                    placeholder="L’URL sera remplie automatiquement après l’upload"
                  />
                </label>

                <label className="admin-upload-box">
                  <span>Télécharger une nouvelle image</span>
                  <strong>
                    {uploading ? "Upload en cours..." : "Choisir une image"}
                  </strong>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(file, "sejour");
                    }}
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  value={sejourForm.description}
                  onChange={(event) =>
                    updateSejourForm("description", event.target.value)
                  }
                />
              </label>

              <label>
                Objectifs pédagogiques
                <textarea
                  value={sejourForm.objectivesText}
                  onChange={(event) =>
                    updateSejourForm("objectivesText", event.target.value)
                  }
                  placeholder="Un objectif par ligne"
                />
              </label>

              <label>
                Programme jour par jour
                <textarea
                  className="admin-program-textarea"
                  value={sejourForm.programText}
                  onChange={(event) =>
                    updateSejourForm("programText", event.target.value)
                  }
                  placeholder={
                    "Jour 1 | Titre de la journée | Texte du programme\nJour 2 | Titre de la journée | Texte du programme"
                  }
                />
              </label>

              <label>
                Budget visites
                <input
                  value={sejourForm.visitBudget}
                  onChange={(event) =>
                    updateSejourForm("visitBudget", event.target.value)
                  }
                />
              </label>

              <label>
                Autres visites possibles
                <textarea
                  value={sejourForm.possibleVisits}
                  onChange={(event) =>
                    updateSejourForm("possibleVisits", event.target.value)
                  }
                />
              </label>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={sejourForm.featured}
                    onChange={(event) =>
                      updateSejourForm("featured", event.target.checked)
                    }
                  />
                  Afficher dans Nos séjours phares
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={sejourForm.hidden}
                    onChange={(event) =>
                      updateSejourForm("hidden", event.target.checked)
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
              Le dashboard est connecté à Supabase. Les fiches voyages, images
              et cartes “À ne pas manquer” sont administrables depuis cette
              page.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}