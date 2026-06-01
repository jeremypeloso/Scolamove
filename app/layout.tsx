import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scolamove — Séjours linguistiques scolaires clés en main",
  description:
    "Scolamove accompagne les enseignants dans l'organisation de voyages scolaires linguistiques fiables, personnalisés et faciles à faire valider.",
  openGraph: {
    title: "Scolamove — Séjours linguistiques scolaires",
    description:
      "Recevez une proposition de séjour scolaire personnalisée avec programme, budget, transport, hébergement et visites.",
    type: "website",
    locale: "fr_FR",
    siteName: "Scolamove",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}