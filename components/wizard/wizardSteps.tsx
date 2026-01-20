import type { ReactNode } from "react";
import {
  FaHouse,
  FaClock,
  FaTree,
  FaLocationDot,
  FaPalette,
  FaCouch,
  FaEye,
  FaRug,
  FaLeaf,
} from "react-icons/fa6";

export type WizardOption = {
  value: string;
  label: string;
  hint?: string;
  image?: string;
  group?: string;
};

export type WizardStepDefinition = {
  key: string;
  label: string;
  description: string;
  options: WizardOption[];
  icon: ReactNode;
  multiSelect?: boolean;
  optionGroups?: string[];
};

export const wizardSteps: WizardStepDefinition[] = [
  {
    key: "kind",
    label: "Raumfokus",
    description:
      "Welche Art von Raum soll visualisiert werden? Wählen Sie den Schwerpunkt für die Szene.",
    options: [
      {
        value: "kueche",
        label: "Küche",
        hint: "Standard",
        image: "/wizard-presets/kind-kueche.jpg",
      },
      {
        value: "wohnzimmer",
        label: "Wohnzimmer",
        image: "/wizard-presets/kind-wohnzimmer.jpg",
      },
      {
        value: "from the outside",
        label: "Außenansicht",
        image: "/wizard-presets/kind-aussen.jpg",
      },
      {
        value: "flur",
        label: "Flur",
        image: "/wizard-presets/kind-flur.jpg",
      },
    ],
    icon: <FaPalette className="w-full h-full text-red-600" />,
  },
  {
    key: "color",
    label: "Farbwelt",
    description:
      "Definieren Sie die dominante Farbgebung für Möbel, Fronten und Akzente – wahlweise aus der Rotpunkt Palette oder originalen FENIX NTM® Farbtönen.",
    options: [
      { value: "schwarz", label: "Schwarz" },
      { value: "rot", label: "Rot" },
      { value: "burgunderrot", label: "Burgunderrot" },
      { value: "weiß", label: "Weiß" },
      { value: "holz", label: "Holz" },
      { value: "dunkles holz", label: "Dunkles Holz" },
    ],
    icon: <FaPalette className="w-full h-full text-red-600" />,
  },
  {
    key: "style",
    label: "Stilrichtung",
    description:
      "Welcher Einrichtungsstil passt am besten? Diese Auswahl bestimmt Linienführung und Materialmix.",
    options: [
      {
        value: "modern",
        label: "Modern",
        image: "/wizard-presets/style-modern.jpg",
      },
      {
        value: "zeitlos",
        label: "Zeitlos",
        image: "/wizard-presets/style-zeitlos.jpg",
      },
      {
        value: "natürlich",
        label: "Natürlich",
        image: "/wizard-presets/style-natuerlich.jpg",
      },
      {
        value: "urban",
        label: "Urban",
        image: "/wizard-presets/style-urban.jpg",
      },
      {
        value: "elegant",
        label: "Elegant",
        image: "/wizard-presets/style-elegant.jpg",
      },
      {
        value: "kreativ",
        label: "Kreativ",
        image: "/wizard-presets/style-kreativ.jpg",
      },
      {
        value: "puristisch",
        label: "Puristisch",
        image: "/wizard-presets/style-puristisch.jpg",
      },
      {
        value: "gemütlich",
        label: "Gemütlich",
        image: "/wizard-presets/style-gemuetlich.jpg",
      },
      {
        value: "minimalistisch",
        label: "Minimalistisch",
        image: "/wizard-presets/style-minimalistisch.jpg",
      },
    ],
    icon: <FaCouch className="w-full h-full text-red-600" />,
  },
  {
    key: "environment",
    label: "Atmosphäre",
    description:
      "Legt die Anmutung des Umfelds fest – von urban bis naturnah.",
    options: [
      { value: "stilvoll", label: "Stilvoll" },
      { value: "modern", label: "Modern" },
      { value: "urban", label: "Urban" },
      { value: "naturnah", label: "Naturnah" },
    ],
    icon: <FaTree className="w-full h-full text-red-600" />,
  },
  {
    key: "viewpoint",
    label: "Perspektive",
    description:
      "Wählen Sie die Kameraperspektive und den Fokus für Ihre Visualisierung.",
    options: [
      {
        value: "eye level shot",
        label: "Augenhöhe",
        image: "/wizard-presets/viewpoint-augenhoehe.jpg",
      },
      {
        value: "low angle shot, worm's eye view",
        label: "Froschperspektive",
        image: "/wizard-presets/viewpoint-frosch.jpg",
      },
      {
        value: "high angle shot, bird's eye view",
        label: "Vogelperspektive",
        image: "/wizard-presets/viewpoint-vogel.jpg",
      },
      {
        value: "dutch angle, tilted frame",
        label: "Holländischer Winkel",
        image: "/wizard-presets/viewpoint-dutch.jpg",
      },
      {
        value: "wide shot, long shot, establishing shot",
        label: "Totale",
        image: "/wizard-presets/viewpoint-totale.jpg",
      },
      {
        value: "medium shot, mid shot",
        label: "Halbtotale",
        image: "/wizard-presets/viewpoint-halbtotale.jpg",
      },
      {
        value: "close-up shot",
        label: "Nahaufnahme",
        image: "/wizard-presets/viewpoint-nahaufnahme.jpg",
      },
      {
        value: "full room view, interior panorama",
        label: "Ganzer Raum",
        image: "/wizard-presets/viewpoint-ganzerraum.jpg",
      },
      {
        value: "extreme close-up, detail shot, macro",
        label: "Detailaufnahme",
        image: "/wizard-presets/viewpoint-detail.jpg",
      },
      {
        value: "shallow depth of field, bokeh background",
        label: "Geringe Tiefenschärfe",
        image: "/wizard-presets/viewpoint-shallow-dof.jpg",
      },
      {
        value: "deep depth of field, everything in focus",
        label: "Tiefenschärfe",
        image: "/wizard-presets/viewpoint-deep-dof.jpg",
      },
      {
        value: "soft focus, dreamy blur",
        label: "Weicher Fokus",
        image: "/wizard-presets/viewpoint-soft-focus.jpg",
      },
    ],
    icon: <FaEye className="w-full h-full text-red-600" />,
  },
  {
    key: "location",
    label: "Standort",
    description:
      "Wo befindet sich das Objekt? Diese Option prägt Lichtstimmung und Ausblick.",
    options: [
      {
        value: "mediterrane Küstenstadt",
        label: "Mediterrane Küstenstadt",
        hint: "Warme Farbtöne, Meeresreflexionen",
      },
      {
        value: "historisches altstadtviertel",
        label: "Historisches Altstadtviertel",
        hint: "Kopfsteinpflaster, warmes Abendlicht",
      },
      {
        value: "nordisches fjordhaus",
        label: "Nordisches Fjordhaus",
        hint: "Viel Glas, kühle Farbtemperatur",
      },
      {
        value: "dachterrasse metropole",
        label: "Dachterrasse in einer Metropole",
        hint: "Skyline, urbanes Lichtspiel",
      },
      {
        value: "tropischer regenwald bungalow",
        label: "Tropischer Regenwald-Bungalow",
        hint: "Sattes Grün, diffuse Feuchtigkeit",
      },
    ],
    icon: <FaLocationDot className="w-full h-full text-red-600" />,
  },
  {
    key: "time",
    label: "Zeit",
    description:
      "Beeinflusst Lichtstimmung und Schattenwurf der Szene.",
    options: [
      {
        value: "early morning, dawn light, first light of day",
        label: "Früher Morgen",
        image: "/wizard-presets/time-fruehmorgen.jpg",
      },
      {
        value: "late morning, mid-morning sunlight",
        label: "Später Vormittag",
        image: "/wizard-presets/time-spaetervormittag.jpg",
      },
      {
        value: "noon, midday, high sun, harsh shadows",
        label: "Mittag",
        image: "/wizard-presets/time-mittag.jpg",
      },
      {
        value: "afternoon, warm afternoon light",
        label: "Nachmittag",
        image: "/wizard-presets/time-nachmittag.jpg",
      },
      {
        value: "golden hour, magic hour, warm orange sunlight",
        label: "Goldene Stunde",
        image: "/wizard-presets/time-goldenestunde.jpg",
      },
      {
        value: "dusk, twilight, blue hour",
        label: "Abenddämmerung",
        image: "/wizard-presets/time-abenddaemmerung.jpg",
      },
      {
        value: "evening, interior lighting, ambient lamps",
        label: "Abend",
        image: "/wizard-presets/time-abend.jpg",
      },
      {
        value: "night, nighttime, dark exterior, interior lights glowing",
        label: "Nacht",
        image: "/wizard-presets/time-nacht.jpg",
      },
    ],
    icon: <FaClock className="w-full h-full text-red-600" />,
  },
  {
    key: "floor",
    label: "Boden",
    description:
      "Welcher Bodenbelag soll in der Szene verwendet werden?",
    options: [
      {
        value: "hardwood floor, oak wood flooring",
        label: "Hartholzboden",
        image: "/wizard-presets/floor-hartholz.jpg",
      },
      {
        value: "herringbone parquet floor",
        label: "Fischgrätparkett",
        image: "/wizard-presets/floor-fischgraet.jpg",
      },
      {
        value: "terrazzo floor, speckled stone",
        label: "Terrazzo",
        image: "/wizard-presets/floor-terrazzo.jpg",
      },
      {
        value: "marble floor, polished marble tiles",
        label: "Marmor",
        image: "/wizard-presets/floor-marmor.jpg",
      },
      {
        value: "polished concrete floor",
        label: "Beton",
        image: "/wizard-presets/floor-beton.jpg",
      },
      {
        value: "terracotta tiles, clay floor tiles",
        label: "Terrakotta",
        image: "/wizard-presets/floor-terrakotta.jpg",
      },
      {
        value: "slate floor, natural slate tiles",
        label: "Schiefer",
        image: "/wizard-presets/floor-schiefer.jpg",
      },
      {
        value: "carpet flooring, soft carpet",
        label: "Teppichboden",
        image: "/wizard-presets/floor-teppich.jpg",
      },
    ],
    icon: <FaRug className="w-full h-full text-red-600" />,
  },
  {
    key: "accessories",
    label: "Accessoires & Dekoration",
    description:
      "Wählen Sie Pflanzen und Dekorationselemente für die Szene. Mehrfachauswahl möglich.",
    multiSelect: true,
    optionGroups: ["Pflanzen", "Dekoration"],
    options: [
      {
        value: "indoor plants, houseplants, potted plants",
        label: "Zimmerpflanzen",
        group: "Pflanzen",
      },
      {
        value: "dried flowers, dried botanicals",
        label: "Trockenblumen",
        group: "Pflanzen",
      },
      {
        value: "fresh flowers, flower bouquet in vase",
        label: "Frische Blumen",
        group: "Pflanzen",
      },
      {
        value: "hanging plants, trailing plants from ceiling",
        label: "Hängepflanzen",
        group: "Pflanzen",
      },
      {
        value: "decorative books, coffee table books",
        label: "Bücher",
        group: "Dekoration",
      },
      {
        value: "ceramic vases, decorative pottery",
        label: "Keramikvasen",
        group: "Dekoration",
      },
      {
        value: "copper pots and pans, hanging cookware",
        label: "Töpfe & Pfannen",
        group: "Dekoration",
      },
      {
        value: "candles, decorative candles, candlesticks",
        label: "Kerzen",
        group: "Dekoration",
      },
      {
        value: "decorative mirror, wall mirror",
        label: "Spiegel",
        group: "Dekoration",
      },
    ],
    icon: <FaLeaf className="w-full h-full text-red-600" />,
  },
  {
    key: "houseType",
    label: "Gebäude",
    description:
      "Welche Architektur umgibt den Raum? Definiert Rahmen und Außenhülle.",
    options: [
      {
        value: "modernes Holzhaus mit großen Fenstern",
        label: "Modernes Holzhaus mit großen Fenstern",
        hint: "Skandinavisch inspiriert, viel Tageslicht",
      },
      { value: "Stadtwohnung", label: "Stadtwohnung" },
      { value: "Loft", label: "Loft" },
      { value: "Landhaus", label: "Landhaus" },
      {
        value: "penthouse mit dachterrasse",
        label: "Penthouse mit Dachterrasse",
        hint: "Panoramablick, Glas und Stahl",
      },
      {
        value: "historische villa",
        label: "Historische Villa",
        hint: "Hohe Decken, Stuck und Parkett",
      },
      {
        value: "reihenhaus mit garten",
        label: "Reihenhaus mit Garten",
        hint: "Familienfreundlich, grüne Oase",
      },
      {
        value: "architektenhaus aus sichtbeton",
        label: "Architektenhaus aus Sichtbeton",
        hint: "Brutalistische Klarheit, starke Linien",
      },
    ],
    icon: <FaHouse className="w-full h-full text-red-600" />,
  },
];
