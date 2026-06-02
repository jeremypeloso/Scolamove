"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type TeacherProject = {
  id: string;
  access_code: string;
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
};

type Participant = {
  id: string;
  project_id: string;
  first_name: string;
  last_name: string;
  class_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  document_status: string;
  payment_status: string;
};

type ParticipantDocument = {
  id: string;
  participant_id: string;
  project_id: string;
  title: string;
  category: string;
  status: string;
  file_url: string | null;
};

type ParticipantPayment = {
  id: string;
  participant_id: string;
  project_id: string;
  label: string;
  amount_due: number | null;
  amount_paid: number | null;
  status: string;
  due_date: string | null;
};

const REQUIRED_DOCUMENTS = [
  ["Autorisation parentale", "Autorisation"],
  ["Fiche sanitaire", "Santé"],
  ["Pièce d’identité", "Identité"],
  ["Attestation d’assurance", "Assurance"],
  ["Engagement famille", "Document"],
];

function formatDate(value: string | null) {
  if (!value) return "À préciser";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function extractAmount(value: string | null) {
  if (!value) return null;

  const match = value.replace(",", ".").match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

export default function TeacherProjectPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [project, setProject] = useState<TeacherProject | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantDocuments, setParticipantDocuments] = useState<
    ParticipantDocument[]
  >([]);
  const [participantPayments, setParticipantPayments] = useState<
    ParticipantPayment[]
  >([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [participantForm, setParticipantForm] = useState({
    firstName: "",
    lastName: "",
    className: "",
    parentEmail: "",
    parentPhone: "",
  });

  useEffect(() => {
    loadProject();
  }, [params.id, code]);

  async function loadProject() {
    setLoading(true);

    const { data, error } = await supabase
      .from("teacher_projects")
      .select("*")
      .eq("id", params.id)
      .eq("access_code", code.toUpperCase())
      .single();

    if (error || !data) {
      setProject(null);
      setLoading(false);
      return;
    }

    setProject(data as TeacherProject);
    await loadProjectData(data.id);
    setLoading(false);
  }

  async function loadProjectData(projectId: string) {
    await Promise.all([
      loadParticipants(projectId),
      loadParticipantDocuments(projectId),
      loadParticipantPayments(projectId),
    ]);
  }

  async function loadParticipants(projectId: string) {
    const { data } = await supabase
      .from("project_participants")
      .select("*")
      .eq("project_id", projectId)
      .order("last_name", { ascending: true });

    setParticipants((data || []) as Participant[]);
  }

  async function loadParticipantDocuments(projectId: string) {
    const { data } = await supabase
      .from("participant_documents")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    setParticipantDocuments((data || []) as ParticipantDocument[]);
  }

  async function loadParticipantPayments(projectId: string) {
    const { data } = await supabase
      .from("participant_payments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    setParticipantPayments((data || []) as ParticipantPayment[]);
  }

  const selectedParticipant = useMemo(() => {
    return (
      participants.find(
        (participant) => participant.id === selectedParticipantId
      ) || participants[0] || null
    );
  }, [participants, selectedParticipantId]);

  const selectedDocuments = participantDocuments.filter(
    (document) => document.participant_id === selectedParticipant?.id
  );

  const selectedPayments = participantPayments.filter(
    (payment) => payment.participant_id === selectedParticipant?.id
  );

  const completedParticipants = participants.filter((participant) => {
    const docs = participantDocuments.filter(
      (document) => document.participant_id === participant.id
    );

    return docs.length > 0 && docs.every((document) => document.status === "Reçu");
  }).length;

  const paidParticipants = participants.filter((participant) => {
    const payments = participantPayments.filter(
      (payment) => payment.participant_id === participant.id
    );

    return (
      payments.length > 0 &&
      payments.every((payment) => payment.status === "Payé")
    );
  }).length;

  const totalDue = participantPayments.reduce((total, payment) => {
    return total + Number(payment.amount_due || 0);
  }, 0);

  const totalPaid = participantPayments.reduce((total, payment) => {
    return total + Number(payment.amount_paid || 0);
  }, 0);

  async function addParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!project) return;

    if (!participantForm.firstName.trim() || !participantForm.lastName.trim()) {
      setStatus("Renseigne au minimum le prénom et le nom de l’élève.");
      return;
    }

    setStatus("Ajout de l’élève en cours...");

    const { data: participant, error } = await supabase
      .from("project_participants")
      .insert({
        project_id: project.id,
        first_name: participantForm.firstName.trim(),
        last_name: participantForm.lastName.trim(),
        class_name: participantForm.className.trim() || null,
        parent_email: participantForm.parentEmail.trim() || null,
        parent_phone: participantForm.parentPhone.trim() || null,
        document_status: "Manquant",
        payment_status: "En attente",
      })
      .select()
      .single();

    if (error || !participant) {
      setStatus(`Erreur : ${error?.message || "participant non créé"}`);
      return;
    }

    const documentRows = REQUIRED_DOCUMENTS.map(([title, category]) => ({
      participant_id: participant.id,
      project_id: project.id,
      title,
      category,
      status: "Manquant",
    }));

    const { error: documentsError } = await supabase
      .from("participant_documents")
      .insert(documentRows);

    if (documentsError) {
      setStatus(`Erreur documents : ${documentsError.message}`);
      return;
    }

    const amount = extractAmount(project.budget_target);

    const { error: paymentError } = await supabase
      .from("participant_payments")
      .insert({
        participant_id: participant.id,
        project_id: project.id,
        label: "Participation au séjour",
        amount_due: amount,
        amount_paid: 0,
        status: "En attente",
      });

    if (paymentError) {
      setStatus(`Erreur paiement : ${paymentError.message}`);
      return;
    }

    setParticipantForm({
      firstName: "",
      lastName: "",
      className: "",
      parentEmail: "",
      parentPhone: "",
    });

    setSelectedParticipantId(participant.id);
    setStatus("Élève ajouté avec documents et paiement automatiques.");
    await loadProjectData(project.id);
  }

  async function updateDocument(
    document: ParticipantDocument,
    statusValue: string
  ) {
    if (!project) return;

    const { error } = await supabase
      .from("participant_documents")
      .update({ status: statusValue })
      .eq("id", document.id);

    if (error) {
      setStatus(`Erreur : ${error.message}`);
      return;
    }

    await refreshParticipantGlobalStatus(document.participant_id);
    await loadProjectData(project.id);
  }

  async function updatePayment(
    payment: ParticipantPayment,
    statusValue: string
  ) {
    if (!project) return;

    const amountPaid =
      statusValue === "Payé" ? Number(payment.amount_due || 0) : payment.amount_paid;

    const { error } = await supabase
      .from("participant_payments")
      .update({
        status: statusValue,
        amount_paid: amountPaid,
      })
      .eq("id", payment.id);

    if (error) {
      setStatus(`Erreur : ${error.message}`);
      return;
    }

    await refreshParticipantGlobalStatus(payment.participant_id);
    await loadProjectData(project.id);
  }

  async function refreshParticipantGlobalStatus(participantId: string) {
    const { data: docs } = await supabase
      .from("participant_documents")
      .select("*")
      .eq("participant_id", participantId);

    const { data: pays } = await supabase
      .from("participant_payments")
      .select("*")
      .eq("participant_id", participantId);

    const documentStatus =
      docs && docs.length > 0 && docs.every((doc) => doc.status === "Reçu")
        ? "Reçu"
        : "Manquant";

    const paymentStatus =
      pays && pays.length > 0 && pays.every((payment) => payment.status === "Payé")
        ? "Payé"
        : pays && pays.some((payment) => payment.status === "Partiel")
          ? "Partiel"
          : "En attente";

    await supabase
      .from("project_participants")
      .update({
        document_status: documentStatus,
        payment_status: paymentStatus,
      })
      .eq("id", participantId);
  }

  async function deleteParticipant(participantId: string) {
    if (!project) return;

    const confirmation = window.confirm(
      "Supprimer cet élève, ses documents et son paiement ?"
    );
    if (!confirmation) return;

    const { error } = await supabase
      .from("project_participants")
      .delete()
      .eq("id", participantId);

    if (error) {
      setStatus(`Erreur : ${error.message}`);
      return;
    }

    setSelectedParticipantId("");
    setStatus("Élève supprimé.");
    await loadProjectData(project.id);
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="teacher-project-page">Chargement...</main>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header />
        <main className="teacher-project-page">
          <section className="teacher-project-card">
            <h1>Accès impossible</h1>
            <p>
              Le lien ou le code d’accès est incorrect. Merci de vérifier les
              informations transmises par Scolamove.
            </p>
            <a href="/espace-enseignant" className="btn btn-primary">
              Retour à la connexion
            </a>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="teacher-project-page">
        <section className="teacher-project-hero">
          <div>
            <span>{project.status}</span>
            <h1>{project.sejour_title}</h1>
            <p>
              {project.school_name}
              {project.school_city ? ` · ${project.school_city}` : ""}
            </p>
          </div>

          <div className="teacher-code-card">
            <span>Code projet</span>
            <strong>{project.access_code}</strong>
          </div>
        </section>

        <section className="teacher-project-grid">
          <article className="teacher-stat-card">
            <span>Participants</span>
            <strong>
              {participants.length}
              {project.student_target ? ` / ${project.student_target}` : ""}
            </strong>
          </article>

          <article className="teacher-stat-card">
            <span>Dossiers élèves complets</span>
            <strong>
              {completedParticipants} / {participants.length}
            </strong>
          </article>

          <article className="teacher-stat-card">
            <span>Paiements réglés</span>
            <strong>
              {paidParticipants} / {participants.length}
            </strong>
          </article>

          <article className="teacher-stat-card">
            <span>Budget suivi</span>
            <strong>
              {totalPaid} € / {totalDue} €
            </strong>
          </article>
        </section>

        <section className="teacher-project-card">
          <h2>Informations du projet</h2>

          <div className="teacher-info-grid">
            <div>
              <span>Responsable</span>
              <strong>{project.teacher_name}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{project.teacher_email}</strong>
            </div>

            <div>
              <span>Téléphone</span>
              <strong>{project.teacher_phone || "À préciser"}</strong>
            </div>

            <div>
              <span>Dates</span>
              <strong>
                {formatDate(project.start_date)} → {formatDate(project.end_date)}
              </strong>
            </div>

            <div>
              <span>Niveau</span>
              <strong>{project.level || "À préciser"}</strong>
            </div>

            <div>
              <span>Budget cible</span>
              <strong>{project.budget_target || "À préciser"}</strong>
            </div>
          </div>
        </section>

        <section className="teacher-project-card">
          <div className="teacher-card-head">
            <div>
              <h2>Élèves participants</h2>
              <p>
                Ajoutez un élève une seule fois : ses documents et son paiement
                sont créés automatiquement.
              </p>
            </div>
          </div>

          <form className="teacher-inline-form" onSubmit={addParticipant}>
            <input
              value={participantForm.firstName}
              onChange={(event) =>
                setParticipantForm({
                  ...participantForm,
                  firstName: event.target.value,
                })
              }
              placeholder="Prénom"
            />

            <input
              value={participantForm.lastName}
              onChange={(event) =>
                setParticipantForm({
                  ...participantForm,
                  lastName: event.target.value,
                })
              }
              placeholder="Nom"
            />

            <input
              value={participantForm.className}
              onChange={(event) =>
                setParticipantForm({
                  ...participantForm,
                  className: event.target.value,
                })
              }
              placeholder="Classe"
            />

            <input
              value={participantForm.parentEmail}
              onChange={(event) =>
                setParticipantForm({
                  ...participantForm,
                  parentEmail: event.target.value,
                })
              }
              placeholder="Email parent"
            />

            <button type="submit">Ajouter</button>
          </form>

          <div className="teacher-split-layout">
            <div className="teacher-student-list">
              {participants.map((participant) => {
                const docs = participantDocuments.filter(
                  (document) => document.participant_id === participant.id
                );
                const docsReceived = docs.filter(
                  (document) => document.status === "Reçu"
                ).length;

                const payments = participantPayments.filter(
                  (payment) => payment.participant_id === participant.id
                );
                const paymentStatus =
                  payments[0]?.status || participant.payment_status;

                return (
                  <button
                    key={participant.id}
                    type="button"
                    className={
                      selectedParticipant?.id === participant.id
                        ? "teacher-student-row active"
                        : "teacher-student-row"
                    }
                    onClick={() => setSelectedParticipantId(participant.id)}
                  >
                    <strong>
                      {participant.last_name} {participant.first_name}
                    </strong>

                    <span>{participant.class_name || "Classe ?"}</span>

                    <small>
                      Documents {docsReceived}/{docs.length || REQUIRED_DOCUMENTS.length} ·{" "}
                      Paiement {paymentStatus}
                    </small>
                  </button>
                );
              })}

              {!participants.length && (
                <p className="teacher-empty">Aucun élève ajouté.</p>
              )}
            </div>

            <div className="teacher-student-detail">
              {selectedParticipant ? (
                <>
                  <div className="teacher-card-head">
                    <div>
                      <h3>
                        {selectedParticipant.first_name}{" "}
                        {selectedParticipant.last_name}
                      </h3>
                      <p>{selectedParticipant.class_name || "Classe à préciser"}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteParticipant(selectedParticipant.id)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <h4>Documents à fournir</h4>

                  <div className="teacher-detail-list">
                    {selectedDocuments.map((document) => (
                      <div key={document.id}>
                        <strong>{document.title}</strong>
                        <span>{document.category}</span>

                        <select
                          value={document.status}
                          onChange={(event) =>
                            updateDocument(document, event.target.value)
                          }
                        >
                          <option>Manquant</option>
                          <option>Demandé</option>
                          <option>Reçu</option>
                          <option>Validé</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <h4>Paiement</h4>

                  <div className="teacher-detail-list">
                    {selectedPayments.map((payment) => (
                      <div key={payment.id}>
                        <strong>{payment.label}</strong>
                        <span>{payment.amount_due || 0} €</span>

                        <select
                          value={payment.status}
                          onChange={(event) =>
                            updatePayment(payment, event.target.value)
                          }
                        >
                          <option>En attente</option>
                          <option>Partiel</option>
                          <option>Payé</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="teacher-empty">
                  Sélectionnez un élève pour voir ses documents et son paiement.
                </p>
              )}
            </div>
          </div>
        </section>

        {status && <p className="teacher-floating-status">{status}</p>}
      </main>
    </>
  );
}