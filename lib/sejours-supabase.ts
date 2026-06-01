import type { Sejour } from "./sejours";

export type SupabaseProgramDay = {
  day: string;
  title: string;
  text: string;
};

export type SupabaseSejour = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  country: string;
  region: string;
  language: string;
  duration: string;
  level: string;
  accommodation: string;
  transport: string;
  price: string;
  image: string;
  badge: string | null;
  featured: boolean;
  hidden: boolean;
  theme: string | null;
  description: string | null;
  objectives: string[];
  program: SupabaseProgramDay[];
  visit_budget: string | null;
  possible_visits: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SupabaseSejourInput = Omit<
  SupabaseSejour,
  "id" | "created_at" | "updated_at"
>;

export function sejourToSupabaseInput(sejour: Sejour): SupabaseSejourInput {
  return {
    slug: sejour.id,
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
    badge: sejour.badge || null,
    featured: Boolean(sejour.featured),
    hidden: false,
    theme: sejour.theme || null,
    description: sejour.description || null,
    objectives: sejour.objectives || [],
    program: sejour.program || [],
    visit_budget: sejour.visitBudget || null,
    possible_visits: sejour.possibleVisits || null,
  };
}

export function programToText(program: SupabaseProgramDay[] = []) {
  return program
    .map((item) => `${item.day} | ${item.title} | ${item.text}`)
    .join("\n");
}

export function textToProgram(value: string): SupabaseProgramDay[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day = "", title = "", ...textParts] = line.split("|");

      return {
        day: day.trim(),
        title: title.trim(),
        text: textParts.join("|").trim(),
      };
    });
}

export function joinLines(value?: string[]) {
  return value?.join("\n") ?? "";
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}