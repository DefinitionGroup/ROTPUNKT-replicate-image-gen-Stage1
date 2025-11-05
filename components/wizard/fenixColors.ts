export type FenixColor = {
  name: string;
  hex: string;
};

export const FENIX_COLOR_PREFIX = "fenix:";

export const fenixColors: FenixColor[] = [
  { name: "Bianco Male", hex: "#F9F8F5" },
  { name: "Bianco Alaska", hex: "#FBF8FA" },
  { name: "Bianco Kos", hex: "#FFFFFF" },
  { name: "Castoro Ottawa", hex: "#7B6C5D" },
  { name: "Grigio Londra", hex: "#4D4A47" },
  { name: "Beige Luxor", hex: "#B6A48B" },
  { name: "Black", hex: "#000000" },
  { name: "Grey", hex: "#444446" },
  { name: "Grigio Efeso", hex: "#7A7B7B" },
  { name: "Beige Arizona", hex: "#B3A99A" },
  { name: "Cacao Orinoco", hex: "#4C3A3A" },
  { name: "Green", hex: "#5F6F6A" },
  { name: "Red", hex: "#783838" },
  { name: "Grigio Antrim", hex: "#808283" },
  { name: "Blue", hex: "#2C3B4C" },
  { name: "Rosso Askja", hex: "#814B48" },
  { name: "Azzuro Naxos", hex: "#5B6E80" },
  { name: "Verde Brac", hex: "#5E7E6E" },
  { name: "Rosso Namib", hex: "#B3472C" },
  { name: "Viola Orissa", hex: "#2B1723" },
  { name: "Giallo Evora", hex: "#D29A6A" },
  { name: "Blu Shaba", hex: "#32444E" },
  { name: "Grigio Aragona", hex: "#3F3B38" },
  { name: "Verde Kitami", hex: "#8FA297" },
  { name: "Acciaio Hamilton", hex: "#8A867B" },
  { name: "Argento Dukat", hex: "#B0AFAE" },
  { name: "Orio Cortez", hex: "#A69B87" },
];

export function encodeFenixColorValue(name: string): string {
  return `${FENIX_COLOR_PREFIX}${name}`;
}

export function isFenixColorValue(value?: string | null): value is string {
  return typeof value === "string" && value.startsWith(FENIX_COLOR_PREFIX);
}

export function getFenixColorByValue(value?: string) {
  if (!isFenixColorValue(value)) return undefined;
  const name = value.slice(FENIX_COLOR_PREFIX.length);
  return fenixColors.find((color) => color.name === name);
}

export function getFenixColorLabel(value?: string) {
  const color = getFenixColorByValue(value);
  return color ? `FENIX: ${color.name}` : undefined;
}
