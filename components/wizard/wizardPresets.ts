import type { WizardState } from "@/app/store/wizardStore";

export type WizardPreset = {
  label: string;
  description: string;
  previewImage?: string;
  options: Partial<WizardState["selectedOptions"]>;
  extraWishes?: string;
};

export const wizardPresets: WizardPreset[] = [
  {
    label: "Scandi Innenansicht",
    description: "Helle Holzoptik, viel Tageslicht und ein naturnahes Setting.",
    previewImage: "/wizard-presets/scandi.jpg",
    options: {
      kind: "kueche",
      color: "holz",
      style: "minimalistisch",
      environment: "naturnah",
      viewpoint: "innenansicht",
      time: "Nachmittag",
    },
    extraWishes:
      "Große Panoramafenster, matte Fronten, dezente schwarze Akzente, viel Grünpflanzen.",
  },
  {
    label: "Urban Loft Außen",
    description: "Dunkle, moderne Loft-Architektur mit urbaner Skyline.",
    previewImage: "/wizard-presets/urban-loft.jpg",
    options: {
      kind: "from the outside",
      color: "schwarz",
      style: "modern",
      environment: "urban",
      viewpoint: "aussenansicht",
      time: "Sonnenuntergang",
    },
    extraWishes:
      "Glasfassade, warmes Innenlicht sichtbar von außen, dezente Neonlicht-Akzente.",
  },
  {
    label: "Luxury Evening",
    description: "Burgunderrote Statement-Küche in eleganter Abendstimmung.",
    previewImage: "/wizard-presets/luxury.jpg",
    options: {
      kind: "kueche",
      color: "burgunderrot",
      style: "luxuriös",
      environment: "stilvoll",
      viewpoint: "innenansicht",
      time: "Abend",
    },
    extraWishes:
      "Indirekte Beleuchtung, Marmorarbeitsplatten, einzelne goldene Armaturen, reflektierender Boden.",
  },
];
