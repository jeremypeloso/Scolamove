import { franceSejours } from "./catalogue-france";
import { italieSejours } from "./catalogue-italie";
import { espagneSejours } from "./catalogue-espagne";

export type Sejour = {
  id: string;
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
  badge: string;
  featured: boolean;
  theme: string;
  description: string;
  objectives: string[];
  program: {
    day: string;
    title: string;
    text: string;
  }[];
  visitBudget?: string;
  possibleVisits?: string;
};

export const sejours: Sejour[] = [
  ...franceSejours,
  ...italieSejours,
  ...espagneSejours,
];