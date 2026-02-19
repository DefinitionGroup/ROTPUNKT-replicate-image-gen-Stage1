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
      environment: "einfamilienhaus",
      viewpoint: "eye level shot",
      time: "afternoon, warm afternoon light",
    },
    extraWishes:
      "Große Panoramafenster, matte Fronten, dezente schwarze Akzente, viel Grünpflanzen.",
  },
  {
    label: "Luxury Evening",
    description: "Burgunderrote Statement-Küche in eleganter Abendstimmung.",
    previewImage: "/wizard-presets/luxury.jpg",
    options: {
      kind: "kueche",
      color: "burgunderrot",
      style: "elegant",
      environment: "apartment-penthouse",
      viewpoint: "full room view, interior panorama",
      time: "evening, interior lighting, ambient lamps",
    },
    extraWishes:
      "Indirekte Beleuchtung, Marmorarbeitsplatten, einzelne goldene Armaturen, reflektierender Boden.",
  },
];
