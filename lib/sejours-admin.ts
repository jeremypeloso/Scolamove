import type { Sejour } from "./sejours";

export type EditableSejour = Sejour & {
  hidden?: boolean;
};

export type SejourOverrides = Record<string, Partial<EditableSejour>>;

const STORAGE_KEY = "scolamove-sejours-overrides";

export function getSejourOverrides(): SejourOverrides {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveSejourOverride(id: string, data: Partial<EditableSejour>) {
  if (typeof window === "undefined") {
    return;
  }

  const current = getSejourOverrides();

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...current,
      [id]: data,
    })
  );
}

export function deleteSejourOverride(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = getSejourOverrides();
  delete current[id];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function getEditableSejours(baseSejours: Sejour[]): EditableSejour[] {
  const overrides = getSejourOverrides();

  return baseSejours
    .map((sejour) => ({
      ...sejour,
      ...overrides[sejour.id],
      id: sejour.id,
    }))
    .filter((sejour) => !sejour.hidden);
}

export function getEditableSejourById(
  baseSejours: Sejour[],
  id: string
): EditableSejour | undefined {
  return getEditableSejours(baseSejours).find((sejour) => sejour.id === id);
}

export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function joinLines(value?: string[]): string {
  return value?.join("\n") ?? "";
}