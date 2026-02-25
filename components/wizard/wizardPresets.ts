import type { WizardState } from "@/app/store/wizardStore";

export type WizardPresetId = "scandi" | "luxury";

export type WizardPreset = {
  id: WizardPresetId;
  previewImage?: string;
  options: Partial<WizardState["selectedOptions"]>;
};

export const wizardPresets: WizardPreset[] = [
  {
    id: "scandi",
    previewImage: "/wizard-presets/scandi.jpg",
    options: {
      kind: "kueche",
      color: "holz",
      style: "minimalistisch",
      environment: "einfamilienhaus",
      viewpoint: "eye level shot",
      time: "afternoon, warm afternoon light",
    },
  },
  {
    id: "luxury",
    previewImage: "/wizard-presets/luxury.jpg",
    options: {
      kind: "kueche",
      color: "burgunderrot",
      style: "elegant",
      environment: "apartment-penthouse",
      viewpoint: "full room view, interior panorama",
      time: "evening, interior lighting, ambient lamps",
    },
  },
];
