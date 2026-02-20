export type FenixColor = {
  name: string;
  hex: string;
  description: string; // German description for UI display
  englishDescription: string; // English description for AI prompt (FLUX T5 encoder)
};

export const FENIX_COLOR_PREFIX = "fenix:";

export const fenixColors: FenixColor[] = [
  {
    name: "Bianco Male",
    hex: "#F9F8F5",
    description: "sanft warmes Kreideweiss",
    englishDescription: "soft warm chalk white",
  },
  {
    name: "Bianco Alaska",
    hex: "#FBF8FA",
    description: "klares Polarweiss mit zartem Roseschimmer",
    englishDescription: "clear polar white with delicate rose shimmer",
  },
  {
    name: "Bianco Kos",
    hex: "#FFFFFF",
    description: "reines neutrales Reinweiss",
    englishDescription: "pure neutral white",
  },
  {
    name: "Castoro Ottawa",
    hex: "#7B6C5D",
    description: "erdiges Taupe mit dezentem Braunton",
    englishDescription: "earthy taupe with subtle brown tone",
  },
  {
    name: "Grigio Londra",
    hex: "#4D4A47",
    description: "tiefes Graphitgrau mit kuehlem Unterton",
    englishDescription: "deep graphite grey with cool undertone",
  },
  {
    name: "Beige Luxor",
    hex: "#B6A48B",
    description: "edles Sandbeige mit goldenem Flair",
    englishDescription: "refined sand beige with golden flair",
  },
  {
    name: "Black",
    hex: "#000000",
    description: "sattes samtiges Tiefschwarz",
    englishDescription: "rich velvety deep black",
  },
  {
    name: "Grey",
    hex: "#444446",
    description: "ausgewogenes Mittelgrau mit neutraler Balance",
    englishDescription: "balanced medium grey with neutral tone",
  },
  {
    name: "Grigio Efeso",
    hex: "#7A7B7B",
    description: "weiches Steingrau mit warmer Note",
    englishDescription: "soft stone grey with warm note",
  },
  {
    name: "Beige Arizona",
    hex: "#B3A99A",
    description: "wuesteninspirierter Beigeton mit sanftem Ocker",
    englishDescription: "desert-inspired beige with soft ochre",
  },
  {
    name: "Cacao Orinoco",
    hex: "#4C3A3A",
    description: "vollmundiges Kakaobraun mit warmer Tiefe",
    englishDescription: "rich cocoa brown with warm depth",
  },
  {
    name: "Green",
    hex: "#5F6F6A",
    description: "gedaempftes Tannengruen mit kuehler Frische",
    englishDescription: "muted pine green with cool freshness",
  },
  {
    name: "Red",
    hex: "#783838",
    description: "klassisches Rubinrot mit samtigem Finish",
    englishDescription: "classic ruby red with velvety finish",
  },
  {
    name: "Grigio Antrim",
    hex: "#808283",
    description: "kuehles Industriegrau mit Stahlcharakter",
    englishDescription: "cool industrial grey with steel character",
  },
  {
    name: "Blue",
    hex: "#2C3B4C",
    description: "dunkles Nachtblau mit satter Tiefe",
    englishDescription: "dark night blue with rich depth",
  },
  {
    name: "Rosso Askja",
    hex: "#814B48",
    description: "vulkanisches Backsteinrot mit rauer Waerme",
    englishDescription: "volcanic brick red with rugged warmth",
  },
  {
    name: "Azzuro Naxos",
    hex: "#5B6E80",
    description: "stuermisches Blau-Grau mit maritimer Note",
    englishDescription: "stormy blue-grey with maritime note",
  },
  {
    name: "Verde Brac",
    hex: "#5E7E6E",
    description: "frisches Salbeigruen mit naturverbundener Ruhe",
    englishDescription: "fresh sage green with natural calm",
  },
  {
    name: "Rosso Namib",
    hex: "#B3472C",
    description: "warmes Terrakottarot mit Wuestenglut",
    englishDescription: "warm terracotta red with desert glow",
  },
  {
    name: "Viola Orissa",
    hex: "#2B1723",
    description: "dramatisches Aubergineviolett mit tiefer Saettigung",
    englishDescription: "dramatic aubergine violet with deep saturation",
  },
  {
    name: "Giallo Evora",
    hex: "#D29A6A",
    description: "sonnengewaermtes Ocker mit Honigschimmer",
    englishDescription: "sun-warmed ochre with honey shimmer",
  },
  {
    name: "Blu Shaba",
    hex: "#32444E",
    description: "tiefes Petrolblau mit edler Kuehle",
    englishDescription: "deep teal blue with refined coolness",
  },
  {
    name: "Grigio Aragona",
    hex: "#3F3B38",
    description: "Schiefergrau mit rauchiger Tiefe",
    englishDescription: "slate grey with smoky depth",
  },
  {
    name: "Verde Kitami",
    hex: "#8FA297",
    description: "zartes Nebelgruen mit kuehler Helligkeit",
    englishDescription: "delicate misty green with cool brightness",
  },
  {
    name: "Acciaio Hamilton",
    hex: "#8A867B",
    description: "patiniertes Stahlgrau mit warmem Unterton",
    englishDescription: "patinated steel grey with warm undertone",
  },
  {
    name: "Argento Dukat",
    hex: "#B0AFAE",
    description: "weiches Silbergrau mit perligem Glanz",
    englishDescription: "soft silver grey with pearly sheen",
  },
  {
    name: "Orio Cortez",
    hex: "#A69B87",
    description: "gereiftes Champagnerbeige mit warmem Schimmer",
    englishDescription: "aged champagne beige with warm shimmer",
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
