"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SupabaseSejour } from "@/lib/sejours-supabase";

type Dossier = {
  id: string;
  sejour_id: string | null;
  sejour_slug: string | null;
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
  internal_notes: string | null;

  dossier_reference: string | null;
  departure_meeting_time: string | null;
  arrival_time: string | null;
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

  status: string;
  sejour_snapshot: SupabaseSejour | null;

  created_at: string;
  updated_at: string;
};

function emptyForm() {
  return {
    sejourId: "",
    schoolName: "",
    schoolCity: "",
    teacherName: "",
    teacherEmail: "",
    teacherPhone: "",
    startDate: "",
    endDate: "",
    studentCount: "",
    chaperoneCount: "",
    departurePlace: "",
    departureTime: "",
    returnTime: "",
    transportDetails:
      "Transport en autocar de tourisme au départ de l’établissement. Organisation des pauses et respect de la réglementation chauffeur.",
    accommodationName: "",
    accommodationAddress: "",
    mealsDetails:
      "Pension selon programme. Allergies et régimes alimentaires à signaler avant le départ.",
    pricePerStudent: "",
    includedServices:
      "Transport, hébergement, restauration selon programme, visites prévues, assistance Scolamove.",
    optionalServices: "",
    safetyNotes:
      "Un interlocuteur Scolamove accompagne l’établissement avant et pendant le séjour. Une procédure d’assistance est prévue en cas d’imprévu.",
    familyNotes:
      "Les familles devront fournir les documents administratifs nécessaires, les autorisations demandées par l’établissement et les informations de santé utiles.",
    internalNotes: "",

    dossierReference: "",
    departureMeetingTime: "",
    arrivalTime: "",
    outboundDistance: "",
    outboundDuration: "",
    returnDistance: "",
    returnDuration: "",
    secondDriverRelay: false,
    driverRestNotes:
      "Afin de respecter la réglementation et de garantir une conduite en sécurité, un temps de repos conducteur peut être prévu selon l’amplitude du séjour.",
    coachAvailabilityNotes:
      "L’autocar peut être immobilisé à certains moments du séjour selon les temps de conduite, les amplitudes et la réglementation en vigueur.",
    localTransportNotes:
      "Pendant les temps d’immobilisation de l’autocar, les déplacements peuvent s’effectuer à pied ou en transports en commun selon le programme.",
    driverMeetingPoints:
      "Les lieux et horaires de rendez-vous avec le conducteur seront confirmés avant le départ.",
    driverNotes: "",
    operationalProgram: "",

    status: "Brouillon",
  };
}

function formFromDossier(dossier: Dossier) {
  return {
    sejourId: dossier.sejour_id || "",
    schoolName: dossier.school_name || "",
    schoolCity: dossier.school_city || "",
    teacherName: dossier.teacher_name || "",
    teacherEmail: dossier.teacher_email || "",
    teacherPhone: dossier.teacher_phone || "",
    startDate: dossier.start_date || "",
    endDate: dossier.end_date || "",
    studentCount: dossier.student_count ? String(dossier.student_count) : "",
    chaperoneCount: dossier.chaperone_count
      ? String(dossier.chaperone_count)
      : "",
    departurePlace: dossier.departure_place || "",
    departureTime: dossier.departure_time || "",
    returnTime: dossier.return_time || "",
    transportDetails: dossier.transport_details || "",
    accommodationName: dossier.accommodation_name || "",
    accommodationAddress: dossier.accommodation_address || "",
    mealsDetails: dossier.meals_details || "",
    pricePerStudent: dossier.price_per_student || "",
    includedServices: dossier.included_services || "",
    optionalServices: dossier.optional_services || "",
    safetyNotes: dossier.safety_notes || "",
    familyNotes: dossier.family_notes || "",
    internalNotes: dossier.internal_notes || "",

    dossierReference: dossier.dossier_reference || "",
    departureMeetingTime: dossier.departure_meeting_time || "",
    arrivalTime: dossier.arrival_time || "",
    outboundDistance: dossier.outbound_distance || "",
    outboundDuration: dossier.outbound_duration || "",
    returnDistance: dossier.return_distance || "",
    returnDuration: dossier.return_duration || "",
    secondDriverRelay: Boolean(dossier.second_driver_relay),
    driverRestNotes: dossier.driver_rest_notes || "",
    coachAvailabilityNotes: dossier.coach_availability_notes || "",
    localTransportNotes: dossier.local_transport_notes || "",
    driverMeetingPoints: dossier.driver_meeting_points || "",
    driverNotes: dossier.driver_notes || "",
    operationalProgram: dossier.operational_program || "",

    status: dossier.status || "Brouillon",
  };
}

export default function AdminDossiersPage() {
  const [sejours, setSejours] = useState<SupabaseSejour[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    loadSejours();
    loadDossiers();
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

  async function loadDossiers() {
    const { data, error } = await supabase
      .from("dossiers_etablissement")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setDossiers(data as Dossier[]);
    }
  }

  const selectedDossier = useMemo(() => {
    return dossiers.find((dossier) => dossier.id === selectedDossierId) || null;
  }, [dossiers, selectedDossierId]);

  const selectedSejour = useMemo(() => {
    return sejours.find((sejour) => sejour.id === form.sejourId) || null;
  }, [sejours, form.sejourId]);

  useEffect(() => {
    if (selectedDossier) {
      setForm(formFromDossier(selectedDossier));
      setSaveStatus("");
    }
  }, [selectedDossier]);

  function updateForm(field: string, value: string) {
    setForm({
      ...form,
      [field]: value,
    });
  }

  function createNewDossier() {
    setSelectedDossierId("");
    setForm(emptyForm());
    setSaveStatus("");
  }

  async function saveDossier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSejour) {
      setSaveStatus("Choisis d’abord une fiche séjour.");
      return;
    }

    if (!form.schoolName.trim() || !form.teacherName.trim()) {
      setSaveStatus("Renseigne au minimum l’établissement et le responsable.");
      return;
    }

    setSaveStatus("Enregistrement en cours...");

    const payload = {
      sejour_id: selectedSejour.id,
      sejour_slug: selectedSejour.slug,
      sejour_title: selectedSejour.title,

      school_name: form.schoolName.trim(),
      school_city: form.schoolCity.trim() || null,
      teacher_name: form.teacherName.trim(),
      teacher_email: form.teacherEmail.trim() || null,
      teacher_phone: form.teacherPhone.trim() || null,

      start_date: form.startDate || null,
      end_date: form.endDate || null,

      student_count: form.studentCount ? Number(form.studentCount) : null,
      chaperone_count: form.chaperoneCount
        ? Number(form.chaperoneCount)
        : null,

      departure_place: form.departurePlace.trim() || null,
      departure_time: form.departureTime.trim() || null,
      return_time: form.returnTime.trim() || null,

      transport_details: form.transportDetails.trim() || null,
      accommodation_name: form.accommodationName.trim() || null,
      accommodation_address: form.accommodationAddress.trim() || null,
      meals_details: form.mealsDetails.trim() || null,

      price_per_student: form.pricePerStudent.trim() || null,
      included_services: form.includedServices.trim() || null,
      optional_services: form.optionalServices.trim() || null,

      safety_notes: form.safetyNotes.trim() || null,
      family_notes: form.familyNotes.trim() || null,
      internal_notes: form.internalNotes.trim() || null,

      dossier_reference: form.dossierReference.trim() || null,
      departure_meeting_time: form.departureMeetingTime.trim() || null,
      arrival_time: form.arrivalTime.trim() || null,
      outbound_distance: form.outboundDistance.trim() || null,
      outbound_duration: form.outboundDuration.trim() || null,
      return_distance: form.returnDistance.trim() || null,
      return_duration: form.returnDuration.trim() || null,
      second_driver_relay: Boolean(form.secondDriverRelay),
      driver_rest_notes: form.driverRestNotes.trim() || null,
      coach_availability_notes: form.coachAvailabilityNotes.trim() || null,
      local_transport_notes: form.localTransportNotes.trim() || null,
      driver_meeting_points: form.driverMeetingPoints.trim() || null,
      driver_notes: form.driverNotes.trim() || null,
      operational_program: form.operationalProgram.trim() || null,

      status: form.status,
      sejour_snapshot: selectedSejour,
    };

    if (selectedDossier) {
      const { error } = await supabase
        .from("dossiers_etablissement")
        .update(payload)
        .eq("id", selectedDossier.id);

      if (error) {
        setSaveStatus(`Erreur : ${error.message}`);
        return;
      }

      setSaveStatus("Dossier modifié.");
      await loadDossiers();
      return;
    }

    const { data, error } = await supabase
      .from("dossiers_etablissement")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedDossierId(data.id);
    setSaveStatus("Dossier créé.");
    await loadDossiers();
  }

  async function deleteDossier() {
    if (!selectedDossier) return;

    const confirmation = window.confirm("Supprimer ce dossier établissement ?");
    if (!confirmation) return;

    const { error } = await supabase
      .from("dossiers_etablissement")
      .delete()
      .eq("id", selectedDossier.id);

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedDossierId("");
    setForm(emptyForm());
    setSaveStatus("Dossier supprimé.");
    await loadDossiers();
  }

  async function duplicateDossier() {
    if (!selectedDossier) return;

    const { id, created_at, updated_at, ...copy } = selectedDossier;

    const { data, error } = await supabase
      .from("dossiers_etablissement")
      .insert({
        ...copy,
        school_name: `${selectedDossier.school_name} - copie`,
        status: "Brouillon",
      })
      .select()
      .single();

    if (error) {
      setSaveStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedDossierId(data.id);
    setSaveStatus("Dossier dupliqué.");
    await loadDossiers();
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Scolamove
          <span>Dossiers établissement</span>
        </div>

        <nav className="admin-menu">
          <a href="/admin">Retour dashboard</a>
          <a href="/">Voir le site</a>
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <span>Administration</span>
            <h1>Dossiers établissement</h1>
          </div>

          <button type="button" onClick={createNewDossier}>
            Nouveau dossier
          </button>
        </div>

        <div className="admin-sejours-layout">
          <aside className="admin-panel admin-sejours-list-panel">
            <div className="admin-list-head">
              <h2>Dossiers</h2>
            </div>

            <div className="admin-sejours-list">
              {dossiers.map((dossier) => (
                <button
                  key={dossier.id}
                  type="button"
                  className={
                    dossier.id === selectedDossierId
                      ? "admin-sejour-row active"
                      : "admin-sejour-row"
                  }
                  onClick={() => setSelectedDossierId(dossier.id)}
                >
                  <span>
                    <strong>{dossier.school_name}</strong>
                    <small>
                      {dossier.sejour_title} · {dossier.status}
                    </small>
                  </span>
                </button>
              ))}

              {!dossiers.length && (
                <p className="empty-section">
                  Aucun dossier créé pour le moment.
                </p>
              )}
            </div>
          </aside>

          <form className="admin-panel admin-form" onSubmit={saveDossier}>
            <div className="admin-edit-head">
              <div>
                <span>Dossier</span>
                <h2>
                  {selectedDossier ? "Modifier le dossier" : "Nouveau dossier"}
                </h2>
              </div>

              {selectedDossier && (
                <div className="admin-editor-actions">
                  <a
                    href={`/admin/dossiers/${selectedDossier.id}`}
                    target="_blank"
                  >
                    Dossier établissement
                  </a>

                  <a
                    href={`/admin/dossiers/${selectedDossier.id}/conducteur`}
                    target="_blank"
                  >
                    Fiche conducteur
                  </a>
                </div>
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
                Responsable du groupe
                <input
                  value={form.teacherName}
                  onChange={(event) =>
                    updateForm("teacherName", event.target.value)
                  }
                  placeholder="Ex : Mme Martin"
                />
              </label>

              <label>
                Email responsable
                <input
                  value={form.teacherEmail}
                  onChange={(event) =>
                    updateForm("teacherEmail", event.target.value)
                  }
                  placeholder="responsable@etablissement.fr"
                />
              </label>

              <label>
                Téléphone responsable
                <input
                  value={form.teacherPhone}
                  onChange={(event) =>
                    updateForm("teacherPhone", event.target.value)
                  }
                  placeholder="06 00 00 00 00"
                />
              </label>

              <label>
                Statut
                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                >
                  <option>Brouillon</option>
                  <option>À valider</option>
                  <option>Validé</option>
                  <option>Archivé</option>
                </select>
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
                Nombre d’élèves
                <input
                  type="number"
                  value={form.studentCount}
                  onChange={(event) =>
                    updateForm("studentCount", event.target.value)
                  }
                />
              </label>

              <label>
                Nombre d’accompagnateurs
                <input
                  type="number"
                  value={form.chaperoneCount}
                  onChange={(event) =>
                    updateForm("chaperoneCount", event.target.value)
                  }
                />
              </label>

              <label>
                Lieu de départ
                <input
                  value={form.departurePlace}
                  onChange={(event) =>
                    updateForm("departurePlace", event.target.value)
                  }
                  placeholder="Devant l’établissement"
                />
              </label>

              <label>
                Heure de départ
                <input
                  value={form.departureTime}
                  onChange={(event) =>
                    updateForm("departureTime", event.target.value)
                  }
                  placeholder="Ex : 07:30"
                />
              </label>

              <label>
                Heure de retour
                <input
                  value={form.returnTime}
                  onChange={(event) =>
                    updateForm("returnTime", event.target.value)
                  }
                  placeholder="Ex : 18:00"
                />
              </label>

              <label>
                Prix par élève
                <input
                  value={form.pricePerStudent}
                  onChange={(event) =>
                    updateForm("pricePerStudent", event.target.value)
                  }
                  placeholder="Ex : 389 €"
                />
              </label>
            </div>

            <label>
              Transport
              <textarea
                value={form.transportDetails}
                onChange={(event) =>
                  updateForm("transportDetails", event.target.value)
                }
              />
            </label>

            <div className="admin-panel">
              <h2>Fiche conducteur / transport</h2>
              <p>
                Ces informations servent à générer une fiche claire pour le
                conducteur ou l’autocariste.
              </p>

              <div className="admin-form-grid two">
                <label>
                  Référence dossier
                  <input
                    value={form.dossierReference}
                    onChange={(event) =>
                      updateForm("dossierReference", event.target.value)
                    }
                    placeholder="Ex : SCO-2026-001"
                  />
                </label>

                <label>
                  Heure de rendez-vous
                  <input
                    value={form.departureMeetingTime}
                    onChange={(event) =>
                      updateForm("departureMeetingTime", event.target.value)
                    }
                    placeholder="Ex : 07:00"
                  />
                </label>

                <label>
                  Heure d’arrivée prévue
                  <input
                    value={form.arrivalTime}
                    onChange={(event) =>
                      updateForm("arrivalTime", event.target.value)
                    }
                    placeholder="Ex : 18:30"
                  />
                </label>

                <label>
                  Distance aller
                  <input
                    value={form.outboundDistance}
                    onChange={(event) =>
                      updateForm("outboundDistance", event.target.value)
                    }
                    placeholder="Ex : 620 km"
                  />
                </label>

                <label>
                  Durée trajet aller
                  <input
                    value={form.outboundDuration}
                    onChange={(event) =>
                      updateForm("outboundDuration", event.target.value)
                    }
                    placeholder="Ex : 8h30"
                  />
                </label>

                <label>
                  Distance retour
                  <input
                    value={form.returnDistance}
                    onChange={(event) =>
                      updateForm("returnDistance", event.target.value)
                    }
                    placeholder="Ex : 620 km"
                  />
                </label>

                <label>
                  Durée trajet retour
                  <input
                    value={form.returnDuration}
                    onChange={(event) =>
                      updateForm("returnDuration", event.target.value)
                    }
                    placeholder="Ex : 8h30"
                  />
                </label>
              </div>

              <div className="admin-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={form.secondDriverRelay}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        secondDriverRelay: event.target.checked,
                      })
                    }
                  />
                  Relais deuxième chauffeur prévu
                </label>
              </div>

              <label>
                Repos conducteur / immobilisation
                <textarea
                  value={form.driverRestNotes}
                  onChange={(event) =>
                    updateForm("driverRestNotes", event.target.value)
                  }
                />
              </label>

              <label>
                Mise à disposition de l’autocar
                <textarea
                  value={form.coachAvailabilityNotes}
                  onChange={(event) =>
                    updateForm("coachAvailabilityNotes", event.target.value)
                  }
                />
              </label>

              <label>
                Transports locaux / déplacements à pied
                <textarea
                  value={form.localTransportNotes}
                  onChange={(event) =>
                    updateForm("localTransportNotes", event.target.value)
                  }
                />
              </label>

              <label>
                Points de rendez-vous conducteur
                <textarea
                  value={form.driverMeetingPoints}
                  onChange={(event) =>
                    updateForm("driverMeetingPoints", event.target.value)
                  }
                />
              </label>

              <label>
                Programme opérationnel conducteur
                <textarea
                  className="admin-program-textarea"
                  value={form.operationalProgram}
                  onChange={(event) =>
                    updateForm("operationalProgram", event.target.value)
                  }
                  placeholder={
                    "Jour 1 :\n07:00 Rendez-vous devant l’établissement\n07:30 Départ autocar\n12:00 Pause déjeuner\n18:30 Arrivée prévue\n\nJour 2 :\n..."
                  }
                />
              </label>

              <label>
                Notes conducteur
                <textarea
                  value={form.driverNotes}
                  onChange={(event) =>
                    updateForm("driverNotes", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid two">
              <label>
                Hébergement
                <input
                  value={form.accommodationName}
                  onChange={(event) =>
                    updateForm("accommodationName", event.target.value)
                  }
                  placeholder="Nom de l’hébergement"
                />
              </label>

              <label>
                Adresse hébergement
                <input
                  value={form.accommodationAddress}
                  onChange={(event) =>
                    updateForm("accommodationAddress", event.target.value)
                  }
                  placeholder="Adresse complète"
                />
              </label>
            </div>

            <label>
              Restauration
              <textarea
                value={form.mealsDetails}
                onChange={(event) =>
                  updateForm("mealsDetails", event.target.value)
                }
              />
            </label>

            <label>
              Prestations incluses
              <textarea
                value={form.includedServices}
                onChange={(event) =>
                  updateForm("includedServices", event.target.value)
                }
              />
            </label>

            <label>
              Options / prestations non incluses
              <textarea
                value={form.optionalServices}
                onChange={(event) =>
                  updateForm("optionalServices", event.target.value)
                }
              />
            </label>

            <label>
              Sécurité et assistance
              <textarea
                value={form.safetyNotes}
                onChange={(event) =>
                  updateForm("safetyNotes", event.target.value)
                }
              />
            </label>

            <label>
              Notes pour les familles
              <textarea
                value={form.familyNotes}
                onChange={(event) =>
                  updateForm("familyNotes", event.target.value)
                }
              />
            </label>

            <label>
              Notes internes
              <textarea
                value={form.internalNotes}
                onChange={(event) =>
                  updateForm("internalNotes", event.target.value)
                }
              />
            </label>

            <div className="admin-editor-actions">
              <button type="submit">
                {selectedDossier ? "Enregistrer" : "Créer le dossier"}
              </button>

              {selectedDossier && (
                <>
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={duplicateDossier}
                  >
                    Dupliquer
                  </button>

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={deleteDossier}
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>

            {saveStatus && <p className="admin-save-status">{saveStatus}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}