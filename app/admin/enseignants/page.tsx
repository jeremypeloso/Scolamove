"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

type TeacherProject = {
  id: string;
  access_code: string;

  sejour_id: string | null;
  sejour_slug: string | null;
  sejour_title: string;

  school_name: string;
  school_city: string | null;
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string | null;

  level: string | null;
  start_date: string | null;
  end_date: string | null;

  student_target: number | null;
  budget_target: string | null;

  status: string;
  notes: string | null;

  created_at: string;
  updated_at: string;
};

type ProjectDocument = {
  id: string;
  project_id: string;
  title: string;
  category: string;
  file_url: string;
  created_at: string;
};

function generateAccessCode() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SCOLA-${digits}`;
}

function emptyForm() {
  return {
    sejourId: "",
    accessCode: generateAccessCode(),
    schoolName: "",
    schoolCity: "",
    teacherName: "",
    teacherEmail: "",
    teacherPhone: "",
    level: "",
    startDate: "",
    endDate: "",
    studentTarget: "",
    budgetTarget: "",
    status: "Projet en préparation",
    notes: "",
  };
}

function formFromProject(project: TeacherProject) {
  return {
    sejourId: project.sejour_id || "",
    accessCode: project.access_code,
    schoolName: project.school_name,
    schoolCity: project.school_city || "",
    teacherName: project.teacher_name,
    teacherEmail: project.teacher_email,
    teacherPhone: project.teacher_phone || "",
    level: project.level || "",
    startDate: project.start_date || "",
    endDate: project.end_date || "",
    studentTarget: project.student_target ? String(project.student_target) : "",
    budgetTarget: project.budget_target || "",
    status: project.status,
    notes: project.notes || "",
  };
}

export default function AdminTeacherProjectsPage() {
  const [sejours, setSejours] = useState<SupabaseSejour[]>([]);
  const [projects, setProjects] = useState<TeacherProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [saveStatus, setSaveStatus] = useState("");
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);
  const [docTitle, setDocTitle] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    loadSejours();
    loadProjects();
  }, []);

  async function loadSejours() {
    const { data, error } = await supabase
      .from("sejours")
      .select("*")
      .eq("hidden", false)
      .order("country", { ascending: true })
      .order("title", { ascending: true });

    if (!error && data) {
      setSejours(data);
    }
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from("teacher_projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setProjects(data as TeacherProject[]);
    }
  }

  const selectedProject = useMemo(() => {
    return (
      projects.find((project) => project.id === selectedProjectId) || null
    );
  }, [projects, selectedProjectId]);

  const selectedSejour = useMemo(() => {
    return sejours.find((sejour) => sejour.id === form.sejourId) || null;
  }, [sejours, form.sejourId]);

  useEffect(() => {
    if (selectedProject) {
      setForm(formFromProject(selectedProject));
      setSaveStatus("");
      loadProjectDocuments(selectedProject.id);
    } else {
      setProjectDocuments([]);
    }
  }, [selectedProject]);

  async function loadProjectDocuments(projectId: string) {
    const { data, error } = await supabase
      .from("project_documents")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjectDocuments(data as ProjectDocument[]);
    }
  }

  async function uploadProjectDocument(file: File) {
    if (!selectedProject) return;
    if (!docTitle.trim()) {
      setSaveStatus("Donne un titre au document avant de l'importer.");
      return;
    }
    setUploadingDoc(true);
    const extension = file.name.split(".").pop() || "pdf";
    const filePath = `${selectedProject.access_code}/${Date.now()}-${docTitle.trim().replace(/[^a-zA-Z0-9-_]+/g, "-")}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("project-documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setSaveStatus(`Erreur upload : ${uploadError.message}`);
      setUploadingDoc(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("project-documents").getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("project_documents").insert({
      project_id: selectedProject.id,
      title: docTitle.trim(),
      category: "Document",
      file_url: publicUrlData.publicUrl,
    });

    setUploadingDoc(false);

    if (insertError) {
      setSaveStatus(`Erreur : ${insertError.message}`);
      return;
    }

    setDocTitle("");
    setSaveStatus("Document ajouté au dossier enseignant ✓");
    await loadProjectDocuments(selectedProject.id);
  }

  async function deleteProjectDocument(docId: string) {
    if (!selectedProject) return;
    const confirmed = window.confirm("Supprimer ce document ?");
    if (!confirmed) return;

    const { error } = await supabase.from("project_documents").delete().eq("id", docId);
    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }
    await loadProjectDocuments(selectedProject.id);
  }

  function updateForm(field: string, value: string) {
    setForm({
      ...form,
      [field]: value,
    });
  }

  function createNewProject() {
    setSelectedProjectId("");
    setForm(emptyForm());
    setSaveStatus("");
  }

  function regenerateCode() {
    setForm({
      ...form,
      accessCode: generateAccessCode(),
    });
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSejour) {
      setSaveStatus("Choisis une fiche séjour.");
      return;
    }

    if (
      !form.schoolName.trim() ||
      !form.teacherName.trim() ||
      !form.teacherEmail.trim()
    ) {
      setSaveStatus("Renseigne au minimum l’établissement, le responsable et l’email.");
      return;
    }

    setSaveStatus("Enregistrement en cours...");

    const payload = {
      access_code: form.accessCode.trim().toUpperCase(),

      sejour_id: selectedSejour.id,
      sejour_slug: selectedSejour.slug,
      sejour_title: selectedSejour.title,

      school_name: form.schoolName.trim(),
      school_city: form.schoolCity.trim() || null,
      teacher_name: form.teacherName.trim(),
      teacher_email: form.teacherEmail.trim(),
      teacher_phone: form.teacherPhone.trim() || null,

      level: form.level.trim() || selectedSejour.level,
      start_date: form.startDate || null,
      end_date: form.endDate || null,

      student_target: form.studentTarget ? Number(form.studentTarget) : null,
      budget_target: form.budgetTarget.trim() || null,

      status: form.status,
      notes: form.notes.trim() || null,
    };

    if (selectedProject) {
      const { error } = await supabase
        .from("teacher_projects")
        .update(payload)
        .eq("id", selectedProject.id);

      if (error) {
        setSaveStatus(`Erreur : ${error.message}`);
        return;
      }

      setSaveStatus("Projet enseignant modifié.");
      await loadProjects();
      return;
    }

    const { data, error } = await supabase
      .from("teacher_projects")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedProjectId(data.id);
    setSaveStatus("Projet enseignant créé.");
    await loadProjects();
  }

  async function deleteProject() {
    if (!selectedProject) return;

    const confirmation = window.confirm("Supprimer ce projet enseignant ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("teacher_projects")
      .delete()
      .eq("id", selectedProject.id);

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedProjectId("");
    setForm(emptyForm());
    setSaveStatus("Projet supprimé.");
    await loadProjects();
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Scolamove
          <span>Projets enseignants</span>
        </div>

        <nav className="admin-menu">
          <a href="/admin">Retour dashboard</a>
          <a href="/espace-enseignant" target="_blank">
            Voir espace enseignant
          </a>
          <a href="/">Voir le site</a>
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <span>Administration</span>
            <h1>Projets enseignants</h1>
          </div>

          <button type="button" onClick={createNewProject}>
            Nouveau projet
          </button>
        </div>

        <div className="admin-sejours-layout">
          <aside className="admin-panel admin-sejours-list-panel">
            <div className="admin-list-head">
              <h2>Projets</h2>
            </div>

            <div className="admin-sejours-list">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={
                    project.id === selectedProjectId
                      ? "admin-sejour-row active"
                      : "admin-sejour-row"
                  }
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <span>
                    <strong>{project.school_name}</strong>
                    <small>
                      {project.sejour_title} · {project.access_code}
                    </small>
                  </span>
                </button>
              ))}

              {!projects.length && (
                <p className="empty-section">
                  Aucun projet enseignant créé pour le moment.
                </p>
              )}
            </div>
          </aside>

          <form className="admin-panel admin-form" onSubmit={saveProject}>
            <div className="admin-edit-head">
              <div>
                <span>Projet enseignant</span>
                <h2>
                  {selectedProject ? "Modifier le projet" : "Nouveau projet"}
                </h2>
              </div>

              {selectedProject && (
                <a
                  href={`/espace-enseignant/projets/${selectedProject.id}?code=${selectedProject.access_code}`}
                  target="_blank"
                >
                  Ouvrir l’espace
                </a>
              )}
            </div>

            <label>
              Séjour associé
              <select
                value={form.sejourId}
                onChange={(event) => updateForm("sejourId", event.target.value)}
              >
                <option value="">Choisir un séjour</option>
                {sejours.map((sejour) => (
                  <option key={sejour.id} value={sejour.id}>
                    {sejour.country} · {sejour.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form-grid two">
              <label>
                Code d’accès enseignant
                <input
                  value={form.accessCode}
                  onChange={(event) =>
                    updateForm("accessCode", event.target.value.toUpperCase())
                  }
                />
              </label>

              <label>
                Générer un nouveau code
                <button type="button" onClick={regenerateCode}>
                  Générer
                </button>
              </label>

              <label>
                Établissement
                <input
                  value={form.schoolName}
                  onChange={(event) =>
                    updateForm("schoolName", event.target.value)
                  }
                  placeholder="Ex : Collège Victor Hugo"
                />
              </label>

              <label>
                Ville
                <input
                  value={form.schoolCity}
                  onChange={(event) =>
                    updateForm("schoolCity", event.target.value)
                  }
                  placeholder="Ex : Lyon"
                />
              </label>

              <label>
                Responsable
                <input
                  value={form.teacherName}
                  onChange={(event) =>
                    updateForm("teacherName", event.target.value)
                  }
                  placeholder="Ex : Mme Martin"
                />
              </label>

              <label>
                Email enseignant
                <input
                  value={form.teacherEmail}
                  onChange={(event) =>
                    updateForm("teacherEmail", event.target.value)
                  }
                  placeholder="enseignant@etablissement.fr"
                />
              </label>

              <label>
                Téléphone
                <input
                  value={form.teacherPhone}
                  onChange={(event) =>
                    updateForm("teacherPhone", event.target.value)
                  }
                  placeholder="06 00 00 00 00"
                />
              </label>

              <label>
                Niveau
                <input
                  value={form.level}
                  onChange={(event) => updateForm("level", event.target.value)}
                  placeholder="Ex : Collège et Lycée"
                />
              </label>

              <label>
                Date de départ
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateForm("startDate", event.target.value)
                  }
                />
              </label>

              <label>
                Date de retour
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => updateForm("endDate", event.target.value)}
                />
              </label>

              <label>
                Nombre d’élèves prévu
                <input
                  type="number"
                  value={form.studentTarget}
                  onChange={(event) =>
                    updateForm("studentTarget", event.target.value)
                  }
                />
              </label>

              <label>
                Budget cible
                <input
                  value={form.budgetTarget}
                  onChange={(event) =>
                    updateForm("budgetTarget", event.target.value)
                  }
                  placeholder="Ex : 450 € / élève"
                />
              </label>

              <label>
                Statut
                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                >
                  <option>Projet en préparation</option>
                  <option>En attente validation établissement</option>
                  <option>Inscriptions ouvertes</option>
                  <option>Documents en cours</option>
                  <option>Paiements en cours</option>
                  <option>Projet confirmé</option>
                  <option>Archivé</option>
                </select>
              </label>
            </div>

            <label>
              Notes internes
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                placeholder="Informations utiles pour le suivi du projet..."
              />
            </label>

            {selectedProject && (
              <div className="admin-panel">
                <h2>Accès enseignant</h2>
                <p>
                  L’enseignant peut accéder à son espace avec ce code :
                </p>

                <div className="admin-access-code">
                  {selectedProject.access_code}
                </div>

                <p>
                  Lien direct :
                  <br />
                  <strong>
                    /espace-enseignant/projets/{selectedProject.id}?code=
                    {selectedProject.access_code}
                  </strong>
                </p>
              </div>
            )}

            {selectedProject && (
              <div className="admin-panel">
                <h2>Documents du dossier</h2>
                <p>
                  Ces fichiers apparaissent directement dans l&apos;espace enseignant du projet.
                  Le devis (s&apos;il a été enregistré depuis Devis Express) y figure automatiquement.
                </p>

                {projectDocuments.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#6b7268" }}>Aucun document déposé pour l&apos;instant.</p>
                ) : (
                  <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                    {projectDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          border: "1px solid #dce8f5",
                          borderRadius: 8,
                        }}
                      >
                        <a href={doc.file_url} target="_blank" rel="noreferrer">
                          {doc.category === "Devis" ? "💶" : "📎"} {doc.title}
                        </a>
                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() => deleteProjectDocument(doc.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label>
                  Titre du document
                  <input
                    value={docTitle}
                    onChange={(event) => setDocTitle(event.target.value)}
                    placeholder="Ex : Contrat de réservation"
                  />
                </label>
                <input
                  type="file"
                  disabled={uploadingDoc}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadProjectDocument(file);
                  }}
                />
                {uploadingDoc && <p style={{ fontSize: 12.5, color: "#6b7268" }}>Envoi en cours...</p>}
              </div>
            )}

            <div className="admin-editor-actions">
              <button type="submit">
                {selectedProject ? "Enregistrer" : "Créer le projet"}
              </button>

              {selectedProject && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={deleteProject}
                >
                  Supprimer
                </button>
              )}
            </div>

            {saveStatus && <p className="admin-save-status">{saveStatus}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}