export type FenixColor = {
  name: string;
  hex: string;
  description: string;
};

export const FENIX_COLOR_PREFIX = "fenix:";

export const fenixColors: FenixColor[] = [
  {
    name: "Bianco Male",
    hex: "#F9F8F5",
    description: "sanft warmes Kreideweiss",
  },
  {
    name: "Bianco Alaska",
    hex: "#FBF8FA",
    description: "klares Polarweiss mit zartem Roseschimmer",
  },
  {
    name: "Bianco Kos",
    hex: "#FFFFFF",
    description: "reines neutrales Reinweiss",
  },
  {
    name: "Castoro Ottawa",
    hex: "#7B6C5D",
    description: "erdiges Taupe mit dezentem Braunton",
  },
  {
    name: "Grigio Londra",
    hex: "#4D4A47",
    description: "tiefes Graphitgrau mit kuehlem Unterton",
  },
  {
    name: "Beige Luxor",
    hex: "#B6A48B",
    description: "edles Sandbeige mit goldenem Flair",
  },
  {
    name: "Black",
    hex: "#000000",
    description: "sattes samtiges Tiefschwarz",
  },
  {
    name: "Grey",
    hex: "#444446",
    description: "ausgewogenes Mittelgrau mit neutraler Balance",
  },
  {
    name: "Grigio Efeso",
    hex: "#7A7B7B",
    description: "weiches Steingrau mit warmer Note",
  },
  {
    name: "Beige Arizona",
    hex: "#B3A99A",
    description: "wuesteninspirierter Beigeton mit sanftem Ocker",
  },
  {
    name: "Cacao Orinoco",
    hex: "#4C3A3A",
    description: "vollmundiges Kakaobraun mit warmer Tiefe",
  },
  {
    name: "Green",
    hex: "#5F6F6A",
    description: "gedaempftes Tannengruen mit kuehler Frische",
  },
  {
    name: "Red",
    hex: "#783838",
    description: "klassisches Rubinrot mit samtigem Finish",
  },
  {
    name: "Grigio Antrim",
    hex: "#808283",
    description: "kuehles Industriegrau mit Stahlcharakter",
  },
  {
    name: "Blue",
    hex: "#2C3B4C",
    description: "dunkles Nachtblau mit satter Tiefe",
  },
  {
    name: "Rosso Askja",
    hex: "#814B48",
    description: "vulkanisches Backsteinrot mit rauer Waerme",
  },
  {
    name: "Azzuro Naxos",
    hex: "#5B6E80",
    description: "stuermisches Blau-Grau mit maritimer Note",
  },
  {
    name: "Verde Brac",
    hex: "#5E7E6E",
    description: "frisches Salbeigruen mit naturverbundener Ruhe",
  },
  {
    name: "Rosso Namib",
    hex: "#B3472C",
    description: "warmes Terrakottarot mit Wuestenglut",
  },
  {
    name: "Viola Orissa",
    hex: "#2B1723",
    description: "dramatisches Aubergineviolett mit tiefer Saettigung",
  },
  {
    name: "Giallo Evora",
    hex: "#D29A6A",
    description: "sonnengewaermtes Ocker mit Honigschimmer",
  },
  {
    name: "Blu Shaba",
    hex: "#32444E",
    description: "tiefes Petrolblau mit edler Kuehle",
  },
  {
    name: "Grigio Aragona",
    hex: "#3F3B38",
    description: "Schiefergrau mit rauchiger Tiefe",
  },
  {
    name: "Verde Kitami",
    hex: "#8FA297",
    description: "zartes Nebelgruen mit kuehler Helligkeit",
  },
  {
    name: "Acciaio Hamilton",
    hex: "#8A867B",
    description: "patiniertes Stahlgrau mit warmem Unterton",
  },
  {
    name: "Argento Dukat",
    hex: "#B0AFAE",
    description: "weiches Silbergrau mit perligem Glanz",
  },
  {
    name: "Orio Cortez",
    hex: "#A69B87",
    description: "gereiftes Champagnerbeige mit warmem Schimmer",
  },
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
  return color ? `FENIX: ${color.name} - ${color.description}` : undefined;
}
