"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";


export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("Vérification en cours...");

    const cleanCode = accessCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from("teacher_projects")
      .select("*")
      .eq("access_code", cleanCode)
      .ilike("teacher_email", email.trim())
      .single();

    if (error || !data) {
      setStatus("Aucun projet trouvé avec cet email et ce code.");
      return;
    }

    router.push(`/espace-enseignant/projets/${data.id}?code=${cleanCode}`);
  }

  return (
    <>
      <Header />

      <main className="teacher-login-page">
        <section className="teacher-login-card">
          <span>Espace enseignant</span>

          <h1>Accédez au suivi de votre voyage scolaire.</h1>

          <p>
            Retrouvez les informations clés de votre projet : participants,
            documents, paiements, dates et échanges avec Scolamove.
          </p>

          <form onSubmit={handleLogin}>
            <label>
              Email enseignant
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@etablissement.fr"
                required
              />
            </label>

            <label>
              Code d’accès projet
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="SCOLA-XXXX"
                required
              />
            </label>

            <button type="submit">Entrer dans mon espace</button>
          </form>

          {status && <p className="teacher-login-status">{status}</p>}
        </section>
      </main>
    </>
  );
}