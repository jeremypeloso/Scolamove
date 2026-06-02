import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const teacherName = String(body.teacherName || "").trim();
    const email = String(body.email || "").trim();

    if (!teacherName || !email) {
      return NextResponse.json(
        { error: "Le nom et l’email sont obligatoires." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("devis").insert({
      school_name: String(body.schoolName || "").trim() || null,
      teacher_name: teacherName,
      email,
      phone: String(body.phone || "").trim() || null,

      departure_city: String(body.departureCity || "").trim() || null,
      destination: String(body.destination || "").trim() || null,
      period: String(body.period || "").trim() || null,
      level: String(body.level || "").trim() || null,
      students_count: String(body.studentsCount || "").trim() || null,

      message: String(body.message || "").trim() || null,

      sejour_slug: String(body.sejourSlug || "").trim() || null,
      sejour_title: String(body.sejourTitle || "").trim() || null,
      sejour_destination: String(body.sejourDestination || "").trim() || null,

      status: "nouveau",
    });

    if (error) {
      return NextResponse.json(
        { error: `Erreur Supabase : ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Votre demande a bien été envoyée. Nous revenons vers vous rapidement.",
    });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue. Merci de réessayer." },
      { status: 500 }
    );
  }
}