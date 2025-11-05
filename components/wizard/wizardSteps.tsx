import type { ReactNode } from "react";
import {
  FaHome,
  FaRegClock,
  FaTree,
  FaMapMarkerAlt,
  FaPalette,
  FaCouch,
  FaEye,
} from "react-icons/fa";

export type WizardOption = {
  value: string;
  label: string;
  hint?: string;
};

export type WizardStepDefinition = {
  key: string;
  label: string;
  description: string;
  options: WizardOption[];
  icon: ReactNode;
};

export const wizardSteps: WizardStepDefinition[] = [
  {
    key: "kind",
    label: "Raumfokus",
    description:
      "Welche Art von Raum soll visualisiert werden? Wählen Sie den Schwerpunkt für die Szene.",
    options: [
      { value: "kueche", label: "Küche", hint: "Standard" },
      { value: "wohnzimmer", label: "Wohnzimmer" },
      { value: "from the outside", label: "Außenansicht" },
      { value: "flur", label: "Flur" },
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
      { value: "elegant", label: "Elegant" },
      { value: "modern", label: "Modern" },
      { value: "minimalistisch", label: "Minimalistisch" },
      { value: "klassisch", label: "Klassisch" },
      { value: "offen", label: "Offen" },
      { value: "luxuriös", label: "Luxuriös" },
      { value: "kompakt", label: "Kompakt" },
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
      "Innen- oder Außenansicht? Diese Wahl steuert die Kameraausrichtung.",
    options: [
      { value: "innenansicht", label: "Innenansicht" },
      { value: "aussenansicht", label: "Außenansicht" },
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
    icon: <FaMapMarkerAlt className="w-full h-full text-red-600" />,
  },
  {
    key: "time",
    label: "Tageszeit",
    description:
      "Beeinflusst Lichtstimmung und Schattenwurf der Szene.",
    options: [
      { value: "Sonnenaufgang", label: "Sonnenaufgang" },
      { value: "Nachmittag", label: "Nachmittag" },
      { value: "Abend", label: "Abend" },
      { value: "Sonnenuntergang", label: "Sonnenuntergang" },
      { value: "Nacht", label: "Nacht" },
    ],
    icon: <FaRegClock className="w-full h-full text-red-600" />,
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
    icon: <FaHome className="w-full h-full text-red-600" />,
  },
];
