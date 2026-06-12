import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Quote = {
  schoolName: string;
  teacherName: string;
  email: string;
  phone: string;
  departureCity: string;
  destination: string;
  period: string;
  level: string;
  studentsCount: string;
  message: string;
  sejourSlug: string;
  sejourTitle: string;
  sejourDestination: string;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function display(value: string) {
  return value || "Non renseigne";
}

function buildEmailText(quote: Quote) {
  return [
    "Nouvelle demande de devis Scolamove",
    "",
    `Etablissement : ${display(quote.schoolName)}`,
    `Enseignant : ${display(quote.teacherName)}`,
    `Email : ${display(quote.email)}`,
    `Telephone : ${display(quote.phone)}`,
    "",
    `Ville de depart : ${display(quote.departureCity)}`,
    `Destination souhaitee : ${display(quote.destination)}`,
    `Periode : ${display(quote.period)}`,
    `Niveau : ${display(quote.level)}`,
    `Nombre d'eleves : ${display(quote.studentsCount)}`,
    "",
    `Sejour selectionne : ${display(quote.sejourTitle)}`,
    `Destination du sejour : ${display(quote.sejourDestination)}`,
    "",
    "Message :",
    display(quote.message),
  ].join("\n");
}

async function sendQuoteEmail(quote: Quote) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from =
    process.env.QUOTE_FROM_EMAIL || "Scolamove <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn(
      "Email devis non envoye : RESEND_API_KEY ou QUOTE_TO_EMAIL manquant."
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: quote.email,
      subject: `Nouvelle demande de devis - ${quote.teacherName}`,
      text: buildEmailText(quote),
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const quote: Quote = {
      schoolName: clean(body.schoolName),
      teacherName: clean(body.teacherName),
      email: clean(body.email),
      phone: clean(body.phone),
      departureCity: clean(body.departureCity),
      destination: clean(body.destination),
      period: clean(body.period),
      level: clean(body.level),
      studentsCount: clean(body.studentsCount),
      message: clean(body.message),
      sejourSlug: clean(body.sejourSlug),
      sejourTitle: clean(body.sejourTitle),
      sejourDestination: clean(body.sejourDestination),
    };

    if (!quote.teacherName || !quote.email) {
      return NextResponse.json(
        { error: "Le nom et l'email sont obligatoires." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("devis").insert({
      school_name: quote.schoolName || null,
      teacher_name: quote.teacherName,
      email: quote.email,
      phone: quote.phone || null,

      departure_city: quote.departureCity || null,
      destination: quote.destination || null,
      period: quote.period || null,
      level: quote.level || null,
      students_count: quote.studentsCount || null,

      message: quote.message || null,

      sejour_slug: quote.sejourSlug || null,
      sejour_title: quote.sejourTitle || null,
      sejour_destination: quote.sejourDestination || null,

      status: "nouveau",
    });

    if (error) {
      return NextResponse.json(
        { error: `Erreur Supabase : ${error.message}` },
        { status: 500 }
      );
    }

    await sendQuoteEmail(quote);

    return NextResponse.json({
      message:
        "Votre demande a bien ete envoyee. Nous revenons vers vous rapidement.",
    });
  } catch (error) {
    console.error("Erreur demande de devis :", error);

    return NextResponse.json(
      { error: "Une erreur est survenue. Merci de reessayer." },
      { status: 500 }
    );
  }
}
