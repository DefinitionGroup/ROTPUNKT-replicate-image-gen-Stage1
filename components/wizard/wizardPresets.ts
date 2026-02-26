import type { WizardState } from "@/app/store/wizardStore";

export type WizardPresetId =
  | "scandi"
  | "luxury"
  | "urbanLoft"
  | "organicModern";

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
      kitchenLook: "kuecheninsel",
      color: "holz",
      handle: "handle:tokyo-holz-198",
      style: "minimalistisch",
      environment: "einfamilienhaus",
      viewpoint: "eye level shot",
      time: "late morning, mid-morning sunlight",
      floor: "herringbone parquet floor",
      accessories: [
        "indoor plants, houseplants, potted plants",
        "ceramic vases, decorative pottery",
        "breakfast food on kitchen table, fresh croissants, coffee cups, fruit bowl, morning breakfast setting",
      ],
    },
  },
  {
    id: "luxury",
    previewImage: "/wizard-presets/luxury.jpg",
    options: {
      kind: "kueche",
      kitchenLook: "kueche-ueber-eck",
      color: "burgunderrot",
      handle: "handle:bp-rotpunkt-themen-kollektion-2024-buster-and-punch-2",
      style: "elegant",
      environment: "apartment-penthouse",
      viewpoint: "full room view, interior panorama",
      time: "evening, interior lighting, ambient lamps",
      floor: "marble floor, polished marble tiles",
      accessories: [
        "candles, decorative candles, candlesticks",
        "decorative mirror, wall mirror",
        "fresh flowers, flower bouquet in vase",
      ],
    },
  },
  {
    id: "urbanLoft",
    previewImage: "/wizard-presets/style-urban.jpg",
    options: {
      kind: "kueche",
      kitchenLook: "kuechenzeile",
      color: "schwarz",
      handle: "handle:std-491",
      style: "urban",
      environment: "loft-industriegebaeude",
      viewpoint: "wide shot, long shot, establishing shot",
      time: "dusk, twilight, blue hour",
      floor: "polished concrete floor",
      accessories: [
        "decorative books, coffee table books",
        "copper pots and pans, hanging cookware",
        "hanging plants, trailing plants from ceiling",
      ],
    },
  },
  {
    id: "organicModern",
    previewImage: "/wizard-presets/style-gemuetlich.jpg",
    options: {
      kind: "kueche",
      kitchenLook: "kuecheninsel",
      color: "weiß",
      handle: "handle:grifflos",
      style: "gemütlich",
      environment: "landhaus",
      viewpoint: "medium shot, mid shot",
      time: "golden hour, magic hour, warm orange sunlight",
      floor: "hardwood floor, oak wood flooring",
      accessories: [
        "dried flowers, dried botanicals",
        "candles, decorative candles, candlesticks",
        "decorative books, coffee table books",
      ],
    },
  },
];
