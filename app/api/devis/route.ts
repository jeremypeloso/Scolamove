import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nom = String(body.nom || "").trim();
    const email = String(body.email || "").trim();
    const eleves = String(body.eleves || "").trim();
    const periode = String(body.periode || "").trim();

    if (!nom || !email || !eleves || !periode) {
      return NextResponse.json(
        { error: "Merci de remplir tous les champs obligatoires." },
        { status: 400 }
      );
    }

    console.log("Nouvelle demande de devis Scolamove :", {
      ...body,
      date: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Votre demande a bien été envoyée. Nous revenons vers vous rapidement.",
    });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue. Merci de réessayer." },
      { status: 500 }
    );
  }
}