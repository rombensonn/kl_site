export function cn(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  return classes
    .flatMap(c => {
      if (!c) return [];
      if (typeof c === "string") return [c];
      if (typeof c === "object") return Object.entries(c).filter(([, v]) => v).map(([k]) => k);
      return [];
    })
    .join(" ");
}
