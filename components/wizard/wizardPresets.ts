import type { WizardState } from "@/app/store/wizardStore";

export type WizardPreset = {
  label: string;
  description: string;
  options: Partial<WizardState["selectedOptions"]>;
  extraWishes?: string;
};

export const wizardPresets: WizardPreset[] = [
  {
    label: "Scandi Innenansicht",
    description: "Helle Holzoptik, viel Tageslicht und ein naturnahes Setting.",
    options: {
      kind: "kueche",
      color: "holz",
      style: "minimalistisch",
      environment: "naturnah",
      viewpoint: "innenansicht",
      location: "am See",
      time: "Nachmittag",
      houseType: "modernes Holzhaus mit großen Fenstern",
    },
    extraWishes:
      "Große Panoramafenster, matte Fronten, dezente schwarze Akzente, viel Grünpflanzen.",
  },
  {
    label: "Urban Loft Außen",
    description: "Dunkle, moderne Loft-Architektur mit urbaner Skyline.",
    options: {
      kind: "from the outside",
      color: "schwarz",
      style: "modern",
      environment: "urban",
      viewpoint: "aussenansicht",
      location: "am Stadtrand",
      time: "Sonnenuntergang",
      houseType: "Loft",
    },
    extraWishes:
      "Glasfassade, warmes Innenlicht sichtbar von außen, dezente Neonlicht-Akzente.",
  },
  {
    label: "Luxury Evening",
    description: "Burgunderrote Statement-Küche in eleganter Abendstimmung.",
    options: {
      kind: "kueche",
      color: "burgunderrot",
      style: "luxuriös",
      environment: "stilvoll",
      viewpoint: "innenansicht",
      location: "am Stadtrand",
      time: "Abend",
      houseType: "Stadtwohnung",
    },
    extraWishes:
      "Indirekte Beleuchtung, Marmorarbeitsplatten, einzelne goldene Armaturen, reflektierender Boden.",
  },
];
