"use client";

import { useState } from "react";
import { sejours } from "@/lib/sejours";
import { supabase } from "@/lib/supabase";
import { sejourToSupabaseInput } from "@/lib/sejours-supabase";

export default function ImportSejoursPage() {
  const [status, setStatus] = useState("");

  async function importSejours() {
    setStatus("Import en cours...");

    const rows = sejours.map(sejourToSupabaseInput);

    const { error } = await supabase.from("sejours").upsert(rows, {
      onConflict: "slug",
    });

    if (error) {
      setStatus(`Erreur : ${error.message}`);
      return;
    }

    setStatus(`${rows.length} fiches importées dans Supabase.`);
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <a href="/admin" className="admin-back">
          Retour admin
        </a>

        <h1>Import Supabase</h1>
        <p>
          Cette page importe les fiches codées actuellement dans ton projet vers
          la table Supabase.
        </p>

        <button type="button" onClick={importSejours}>
          Importer les fiches
        </button>

        {status && <span className="admin-error">{status}</span>}
      </div>
    </main>
  );
}