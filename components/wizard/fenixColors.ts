export type FenixColor = {
  name: string;
  code: string; // Official FENIX code (e.g. 0720)
  fxId: string; // Matching Frontfarben FX catalog id (e.g. 212FX)
  hex: string;
  isMetallic?: boolean; // Metallic decor with subtle metal sheen
  imagePath: string; // Relative path inside public/Frontfarben
  description: string; // German description for UI display
  englishDescription: string; // English description for AI prompt (FLUX T5 encoder)
};

export const FENIX_COLOR_PREFIX = "fenix:";
const FENIX_IMAGE_BASE_PATH = "Matte Kunststofffront/HPL";

function getFenixImagePath(fxId: string) {
  return `${FENIX_IMAGE_BASE_PATH}/${fxId}_converted.jpeg`;
}

export const fenixColors: FenixColor[] = [
  {
    name: "Bianco Male",
    code: "0029",
    fxId: "351FX",
    hex: "#FFFBF6",
    imagePath: getFenixImagePath("351FX"),
    description: "sanft warmes Kreideweiss",
    englishDescription: "soft warm chalk white",
  },
  {
    name: "Bianco Alaska",
    code: "0030",
    fxId: "227FX",
    hex: "#FDF8FC",
    imagePath: getFenixImagePath("227FX"),
    description: "klares Polarweiss mit zartem Roseschimmer",
    englishDescription: "clear polar white with delicate rose shimmer",
  },
  {
    name: "Bianco Kos",
    code: "0032",
    fxId: "260FX",
    hex: "#FCFCFC",
    imagePath: getFenixImagePath("260FX"),
    description: "reines neutrales Reinweiss",
    englishDescription: "pure neutral white",
  },
  {
    name: "Castoro Ottawa",
    code: "0717",
    fxId: "352FX",
    hex: "#7C6C5A",
    imagePath: getFenixImagePath("352FX"),
    description: "erdiges Taupe mit dezentem Braunton",
    englishDescription: "earthy taupe with subtle brown tone",
  },
  {
    name: "Grigio Londra",
    code: "0718",
    fxId: "228FX",
    hex: "#5E5650",
    imagePath: getFenixImagePath("228FX"),
    description: "tiefes Graphitgrau mit kuehlem Unterton",
    englishDescription: "deep graphite grey with cool undertone",
  },
  {
    name: "Beige Luxor",
    code: "0719",
    fxId: "356FX",
    hex: "#B8A388",
    imagePath: getFenixImagePath("356FX"),
    description: "edles Sandbeige mit goldenem Flair",
    englishDescription: "refined sand beige with golden flair",
  },
  {
    name: "Black",
    code: "0720",
    fxId: "212FX",
    hex: "#141414",
    imagePath: getFenixImagePath("212FX"),
    description: "sattes samtiges Tiefschwarz",
    englishDescription: "rich velvety deep black",
  },
  {
    name: "Grey",
    code: "0724",
    fxId: "213FX",
    hex: "#35373C",
    imagePath: getFenixImagePath("213FX"),
    description: "ausgewogenes Mittelgrau mit neutraler Balance",
    englishDescription: "balanced medium grey with neutral tone",
  },
  {
    name: "Grigio Efeso",
    code: "0725",
    fxId: "353FX",
    hex: "#908F8E",
    imagePath: getFenixImagePath("353FX"),
    description: "weiches Steingrau mit warmer Note",
    englishDescription: "soft stone grey with warm note",
  },
  {
    name: "Beige Arizona",
    code: "0748",
    fxId: "240FX",
    hex: "#B1A79D",
    imagePath: getFenixImagePath("240FX"),
    description: "wuesteninspirierter Beigeton mit sanftem Ocker",
    englishDescription: "desert-inspired beige with soft ochre",
  },
  {
    name: "Cacao Orinoco",
    code: "0749",
    fxId: "355FX",
    hex: "#584E4C",
    imagePath: getFenixImagePath("355FX"),
    description: "vollmundiges Kakaobraun mit warmer Tiefe",
    englishDescription: "rich cocoa brown with warm depth",
  },
  {
    name: "Green",
    code: "0750",
    fxId: "223FX",
    hex: "#667373",
    imagePath: getFenixImagePath("223FX"),
    description: "gedaempftes Tannengruen mit kuehler Frische",
    englishDescription: "muted pine green with cool freshness",
  },
  {
    name: "Red",
    code: "0751",
    fxId: "224FX",
    hex: "#774a48",
    imagePath: getFenixImagePath("224FX"),
    description: "klassisches Rubinrot mit samtigem Finish",
    englishDescription: "classic ruby red with velvety finish",
  },
  {
    name: "Grigio Antrim",
    code: "0752",
    fxId: "357FX",
    hex: "#919193",
    imagePath: getFenixImagePath("357FX"),
    description: "kuehles Industriegrau mit Stahlcharakter",
    englishDescription: "cool industrial grey with steel character",
  },
  {
    name: "Blue",
    code: "0754",
    fxId: "225FX",
    hex: "#394459",
    imagePath: getFenixImagePath("225FX"),
    description: "dunkles Nachtblau mit satter Tiefe",
    englishDescription: "dark night blue with rich depth",
  },
  {
    name: "Rosso Askja",
    code: "0770",
    fxId: "371FX",
    hex: "#834f50",
    imagePath: getFenixImagePath("371FX"),
    description: "vulkanisches Backsteinrot mit rauer Waerme",
    englishDescription: "volcanic brick red with rugged warmth",
  },
  {
    name: "Azzuro Naxos",
    code: "0771",
    fxId: "366FX",
    hex: "#5b6e82",
    imagePath: getFenixImagePath("366FX"),
    description: "stuermisches Blau-Grau mit maritimer Note",
    englishDescription: "stormy blue-grey with maritime note",
  },
  {
    name: "Verde Brac",
    code: "0773",
    fxId: "365FX",
    hex: "#627f6f",
    imagePath: getFenixImagePath("365FX"),
    description: "frisches Salbeigruen mit naturverbundener Ruhe",
    englishDescription: "fresh sage green with natural calm",
  },
  {
    name: "Rosso Namib",
    code: "0789",
    fxId: "368FX",
    hex: "#cd4e2c",
    imagePath: getFenixImagePath("368FX"),
    description: "warmes Terrakottarot mit Wuestenglut",
    englishDescription: "warm terracotta red with desert glow",
  },
  {
    name: "Viola Orissa",
    code: "0790",
    fxId: "376FX",
    hex: "#382939",
    imagePath: getFenixImagePath("376FX"),
    description: "dramatisches Aubergineviolett mit tiefer Saettigung",
    englishDescription: "dramatic aubergine violet with deep saturation",
  },
  {
    name: "Giallo Evora",
    code: "0791",
    fxId: "373FX",
    hex: "#c89267",
    imagePath: getFenixImagePath("373FX"),
    description: "sonnengewaermtes Ocker mit Honigschimmer",
    englishDescription: "sun-warmed ochre with honey shimmer",
  },
  {
    name: "Blu Shaba",
    code: "0792",
    fxId: "364FX",
    hex: "#2b3d49",
    imagePath: getFenixImagePath("364FX"),
    description: "tiefes Petrolblau mit edler Kuehle",
    englishDescription: "deep teal blue with refined coolness",
  },
  {
    name: "Grigio Aragona",
    code: "0793",
    fxId: "367FX",
    hex: "#413A37",
    imagePath: getFenixImagePath("367FX"),
    description: "Schiefergrau mit rauchiger Tiefe",
    englishDescription: "slate grey with smoky depth",
  },
  {
    name: "Verde Kitami",
    code: "0794",
    fxId: "361FX",
    hex: "#8f988d",
    imagePath: getFenixImagePath("361FX"),
    description: "zartes Nebelgruen mit kuehler Helligkeit",
    englishDescription: "delicate misty green with cool brightness",
  },
  {
    name: "Acciaio Hamilton",
    code: "5000",
    fxId: "222FX",
    hex: "#8E8B8B",
    isMetallic: true,
    imagePath: getFenixImagePath("222FX"),
    description: "patiniertes Stahlgrau mit warmem Unterton",
    englishDescription: "patinated steel grey with warm undertone",
  },
  {
    name: "Argento Dukat",
    code: "5001",
    fxId: "374FX",
    hex: "#B0B1B6",
    isMetallic: true,
    imagePath: getFenixImagePath("374FX"),
    description: "weiches Silbergrau mit perligem Glanz",
    englishDescription: "soft silver grey with pearly sheen",
  },
  {
    name: "Orio Cortez",
    code: "5003",
    fxId: "369FX",
    hex: "#C2B6A9",
    isMetallic: true,
    imagePath: getFenixImagePath("369FX"),
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
  return color
    ? `FENIX: ${color.name} (${color.code}, ${color.hex}) - ${color.description}`
    : undefined;
}
