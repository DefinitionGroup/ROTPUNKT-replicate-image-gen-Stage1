import type { ReactNode } from "react";
import {
  FaClock,
  FaTree,
  FaPalette,
  FaCouch,
  FaEye,
  FaRug,
  FaLeaf,
} from "react-icons/fa6";

export type WizardOption = {
  value: string;
  labelKey: string;  // Translation key for UI
  germanLabel: string; // German label for UI display fallback
  englishLabel?: string; // English label for AI prompt generation (FLUX T5 encoder is English-trained)
  hintKey?: string;  // Translation key for hint
  image?: string;
  group?: string;
};

export type WizardSubStep = {
  labelKey: string;
  descriptionKey: string;
  options: WizardOption[];
};

export type WizardStepDefinition = {
  key: string;
  labelKey: string;       // Translation key
  descriptionKey: string; // Translation key
  options: WizardOption[];
  icon: ReactNode;
  multiSelect?: boolean;
  optionGroupKeys?: string[]; // Translation keys for groups
  subSteps?: Record<string, WizardSubStep>; // For merged steps (e.g., atmosphere → style/viewpoint/time)
};

export const wizardSteps: WizardStepDefinition[] = [
  {
    key: "environment",
    labelKey: "wizard.steps.environment.label",
    descriptionKey: "wizard.steps.environment.description",
    options: [
      {
        value: "landhaus",
        labelKey: "wizard.options.categoryLandhaus",
        germanLabel: "Landhaus",
        englishLabel: "country house",
        image: "/wizard-presets/category-landhaus.png",
      },
      {
        value: "loft-industriegebaeude",
        labelKey: "wizard.options.categoryLoftIndustriegebaeude",
        germanLabel: "Loft / Industriegebäude",
        englishLabel: "loft / industrial building",
        image: "/wizard-presets/category-loft-industriegebaeude.png",
      },
      {
        value: "stadtwohnung",
        labelKey: "wizard.options.categoryStadtwohnung",
        germanLabel: "Stadtwohnung",
        englishLabel: "city apartment",
        image: "/wizard-presets/category-stadtwohnung.png",
      },
      {
        value: "einfamilienhaus",
        labelKey: "wizard.options.categoryEinfamilienhaus",
        germanLabel: "Einfamilienhaus",
        englishLabel: "single family house",
        image: "/wizard-presets/category-einfamilienhaus.png",
      },
      {
        value: "altbau",
        labelKey: "wizard.options.categoryAltbau",
        germanLabel: "Altbau",
        englishLabel: "classic old building",
        image: "/wizard-presets/category-altbau.png",
      },
      {
        value: "ferienhaus",
        labelKey: "wizard.options.categoryFerienhaus",
        germanLabel: "Ferienhaus",
        englishLabel: "vacation home",
        image: "/wizard-presets/category-ferienhaus.png",
      },
      {
        value: "stadtvilla",
        labelKey: "wizard.options.categoryStadtvilla",
        germanLabel: "Stadtvilla",
        englishLabel: "urban villa",
        image: "/wizard-presets/category-stadtvilla.png",
      },
      {
        value: "apartment-penthouse",
        labelKey: "wizard.options.categoryApartmentPenthouse",
        germanLabel: "Apartment / Penthouse",
        englishLabel: "apartment / penthouse",
        image: "/wizard-presets/category-apartment-penthouse.png",
      },
    ],
    icon: <FaTree className="w-full h-full text-red-600" />,
  },
  {
    key: "kind",
    labelKey: "wizard.steps.kind.label",
    descriptionKey: "wizard.steps.kind.description",
    options: [
      {
        value: "kueche",
        labelKey: "wizard.options.kueche",
        germanLabel: "Küche",
        englishLabel: "kitchen",
        hintKey: "wizard.hints.standard",
        image: "/wizard-presets/kind-kueche.jpg",
      },
      {
        value: "wohnzimmer",
        labelKey: "wizard.options.wohnzimmer",
        germanLabel: "Wohnzimmer",
        englishLabel: "living room",
        image: "/wizard-presets/kind-wohnzimmer.jpg",
      },
      {
        value: "flur",
        labelKey: "wizard.options.flur",
        germanLabel: "Flur",
        englishLabel: "hallway",
        image: "/wizard-presets/kind-flur.jpg",
      },
    ],
    icon: <FaPalette className="w-full h-full text-red-600" />,
  },
  {
    key: "color",
    labelKey: "wizard.steps.color.label",
    descriptionKey: "wizard.steps.color.description",
    options: [
      { value: "schwarz", labelKey: "wizard.options.schwarz", germanLabel: "Schwarz", englishLabel: "black" },
      { value: "rot", labelKey: "wizard.options.rot", germanLabel: "Rot", englishLabel: "red" },
      { value: "burgunderrot", labelKey: "wizard.options.burgunderrot", germanLabel: "Burgunderrot", englishLabel: "burgundy red" },
      { value: "weiß", labelKey: "wizard.options.weiss", germanLabel: "Weiß", englishLabel: "white" },
      { value: "holz", labelKey: "wizard.options.holz", germanLabel: "Holz", englishLabel: "wood" },
      { value: "dunkles holz", labelKey: "wizard.options.dunklesHolz", germanLabel: "Dunkles Holz", englishLabel: "dark wood" },
    ],
    icon: <FaPalette className="w-full h-full text-red-600" />,
  },
  {
    key: "handle",
    labelKey: "wizard.steps.handle.label",
    descriptionKey: "wizard.steps.handle.description",
    options: [],
    icon: <FaPalette className="w-full h-full text-red-600" />,
  },
  {
    key: "atmosphere",
    labelKey: "wizard.steps.atmosphere.label",
    descriptionKey: "wizard.steps.atmosphere.description",
    options: [], // Options are in subSteps below
    icon: <FaCouch className="w-full h-full text-red-600" />,
    subSteps: {
      style: {
        labelKey: "wizard.steps.style.label",
        descriptionKey: "wizard.steps.style.description",
        options: [
          {
            value: "modern",
            labelKey: "wizard.options.modern",
            germanLabel: "Modern",
            englishLabel: "modern",
            image: "/wizard-presets/style-modern.jpg",
          },
          {
            value: "urban",
            labelKey: "wizard.options.urban",
            germanLabel: "Urban",
            englishLabel: "urban",
            image: "/wizard-presets/style-urban.jpg",
          },
          {
            value: "elegant",
            labelKey: "wizard.options.elegant",
            germanLabel: "Elegant",
            englishLabel: "elegant",
            image: "/wizard-presets/style-elegant.jpg",
          },
          {
            value: "kreativ",
            labelKey: "wizard.options.kreativ",
            germanLabel: "Kreativ",
            englishLabel: "creative",
            image: "/wizard-presets/style-kreativ.jpg",
          },
          {
            value: "gemütlich",
            labelKey: "wizard.options.gemuetlich",
            germanLabel: "Gemütlich",
            englishLabel: "cozy",
            image: "/wizard-presets/style-gemuetlich.jpg",
          },
          {
            value: "minimalistisch",
            labelKey: "wizard.options.minimalistisch",
            germanLabel: "Minimalistisch",
            englishLabel: "minimalist",
            image: "/wizard-presets/style-minimalistisch.jpg",
          },
        ],
      },
      viewpoint: {
        labelKey: "wizard.steps.viewpoint.label",
        descriptionKey: "wizard.steps.viewpoint.description",
        options: [
          {
            value: "eye level shot",
            labelKey: "wizard.options.augenhoehe",
            germanLabel: "Augenhöhe",
            image: "/wizard-presets/viewpoint-augenhoehe.jpg",
          },
          {
            value: "low angle shot, worm's eye view",
            labelKey: "wizard.options.froschperspektive",
            germanLabel: "Froschperspektive",
            image: "/wizard-presets/viewpoint-frosch.jpg",
          },
          {
            value: "high angle shot, bird's eye view",
            labelKey: "wizard.options.vogelperspektive",
            germanLabel: "Vogelperspektive",
            image: "/wizard-presets/viewpoint-vogel.jpg",
          },
          {
            value: "dutch angle, tilted frame",
            labelKey: "wizard.options.hollaendischerWinkel",
            germanLabel: "Holländischer Winkel",
            image: "/wizard-presets/viewpoint-dutch.jpg",
          },
          {
            value: "wide shot, long shot, establishing shot",
            labelKey: "wizard.options.totale",
            germanLabel: "Totale",
            image: "/wizard-presets/viewpoint-totale.jpg",
          },
          {
            value: "medium shot, mid shot",
            labelKey: "wizard.options.halbtotale",
            germanLabel: "Halbtotale",
            image: "/wizard-presets/viewpoint-halbtotale.jpg",
          },
          {
            value: "close-up shot",
            labelKey: "wizard.options.nahaufnahme",
            germanLabel: "Nahaufnahme",
            image: "/wizard-presets/viewpoint-nahaufnahme.jpg",
          },
          {
            value: "full room view, interior panorama",
            labelKey: "wizard.options.ganzerRaum",
            germanLabel: "Ganzer Raum",
            image: "/wizard-presets/viewpoint-ganzerraum.jpg",
          },
          {
            value: "extreme close-up, detail shot, macro",
            labelKey: "wizard.options.detailaufnahme",
            germanLabel: "Detailaufnahme",
            image: "/wizard-presets/viewpoint-detail.jpg",
          },
        ],
      },
      time: {
        labelKey: "wizard.steps.time.label",
        descriptionKey: "wizard.steps.time.description",
        options: [
          {
            value: "early morning, dawn light, first light of day",
            labelKey: "wizard.options.frueherMorgen",
            germanLabel: "Früher Morgen",
            image: "/wizard-presets/time-fruehmorgen.jpg",
          },
          {
            value: "late morning, mid-morning sunlight",
            labelKey: "wizard.options.spaeterVormittag",
            germanLabel: "Später Vormittag",
            image: "/wizard-presets/time-spaetervormittag.jpg",
          },
          {
            value: "noon, midday, high sun, harsh shadows",
            labelKey: "wizard.options.mittag",
            germanLabel: "Mittag",
            image: "/wizard-presets/time-mittag.jpg",
          },
          {
            value: "afternoon, warm afternoon light",
            labelKey: "wizard.options.nachmittag",
            germanLabel: "Nachmittag",
            image: "/wizard-presets/time-nachmittag.jpg",
          },
          {
            value: "golden hour, magic hour, warm orange sunlight",
            labelKey: "wizard.options.goldeneStunde",
            germanLabel: "Goldene Stunde",
            image: "/wizard-presets/time-goldenestunde.jpg",
          },
          {
            value: "dusk, twilight, blue hour",
            labelKey: "wizard.options.abenddaemmerung",
            germanLabel: "Abenddämmerung",
            image: "/wizard-presets/time-abenddaemmerung.jpg",
          },
          {
            value: "evening, interior lighting, ambient lamps",
            labelKey: "wizard.options.abend",
            germanLabel: "Abend",
            image: "/wizard-presets/time-abend.jpg",
          },
          {
            value: "night, nighttime, dark exterior, interior lights glowing",
            labelKey: "wizard.options.nacht",
            germanLabel: "Nacht",
            image: "/wizard-presets/time-nacht.jpg",
          },
        ],
      },
    },
  },
  {
    key: "floor",
    labelKey: "wizard.steps.floor.label",
    descriptionKey: "wizard.steps.floor.description",
    options: [
      {
        value: "hardwood floor, oak wood flooring",
        labelKey: "wizard.options.hartholzboden",
        germanLabel: "Hartholzboden",
        image: "/wizard-presets/floor-hartholz.jpg",
      },
      {
        value: "herringbone parquet floor",
        labelKey: "wizard.options.fischgraetparkett",
        germanLabel: "Fischgrätparkett",
        image: "/wizard-presets/floor-fischgraet.jpg",
      },
      {
        value: "terrazzo floor, speckled stone",
        labelKey: "wizard.options.terrazzo",
        germanLabel: "Terrazzo",
        image: "/wizard-presets/floor-terrazzo.jpg",
      },
      {
        value: "marble floor, polished marble tiles",
        labelKey: "wizard.options.marmor",
        germanLabel: "Marmor",
        image: "/wizard-presets/floor-marmor.jpg",
      },
      {
        value: "polished concrete floor",
        labelKey: "wizard.options.beton",
        germanLabel: "Beton",
        image: "/wizard-presets/floor-beton.jpg",
      },
      {
        value: "terracotta tiles, clay floor tiles",
        labelKey: "wizard.options.terrakotta",
        germanLabel: "Terrakotta",
        image: "/wizard-presets/floor-terrakotta.jpg",
      },
      {
        value: "slate floor, natural slate tiles",
        labelKey: "wizard.options.schiefer",
        germanLabel: "Schiefer",
        image: "/wizard-presets/floor-schiefer.jpg",
      },
      {
        value: "carpet flooring, soft carpet",
        labelKey: "wizard.options.teppichboden",
        germanLabel: "Teppichboden",
        image: "/wizard-presets/floor-teppich.jpg",
      },
    ],
    icon: <FaRug className="w-full h-full text-red-600" />,
  },
  {
    key: "accessories",
    labelKey: "wizard.steps.accessories.label",
    descriptionKey: "wizard.steps.accessories.description",
    multiSelect: true,
    optionGroupKeys: ["wizard.optionGroups.pflanzen", "wizard.optionGroups.dekoration", "wizard.optionGroups.essenTrinken"],
    options: [
      {
        value: "indoor plants, houseplants, potted plants",
        labelKey: "wizard.options.zimmerpflanzen",
        germanLabel: "Zimmerpflanzen",
        group: "wizard.optionGroups.pflanzen",
      },
      {
        value: "dried flowers, dried botanicals",
        labelKey: "wizard.options.trockenblumen",
        germanLabel: "Trockenblumen",
        group: "wizard.optionGroups.pflanzen",
      },
      {
        value: "fresh flowers, flower bouquet in vase",
        labelKey: "wizard.options.frischeBlumen",
        germanLabel: "Frische Blumen",
        group: "wizard.optionGroups.pflanzen",
      },
      {
        value: "hanging plants, trailing plants from ceiling",
        labelKey: "wizard.options.haengepflanzen",
        germanLabel: "Hängepflanzen",
        group: "wizard.optionGroups.pflanzen",
      },
      {
        value: "decorative books, coffee table books",
        labelKey: "wizard.options.buecher",
        germanLabel: "Bücher",
        group: "wizard.optionGroups.dekoration",
      },
      {
        value: "ceramic vases, decorative pottery",
        labelKey: "wizard.options.keramikvasen",
        germanLabel: "Keramikvasen",
        group: "wizard.optionGroups.dekoration",
      },
      {
        value: "copper pots and pans, hanging cookware",
        labelKey: "wizard.options.toepfePfannen",
        germanLabel: "Töpfe & Pfannen",
        group: "wizard.optionGroups.dekoration",
      },
      {
        value: "candles, decorative candles, candlesticks",
        labelKey: "wizard.options.kerzen",
        germanLabel: "Kerzen",
        group: "wizard.optionGroups.dekoration",
      },
      {
        value: "decorative mirror, wall mirror",
        labelKey: "wizard.options.spiegel",
        germanLabel: "Spiegel",
        group: "wizard.optionGroups.dekoration",
      },
      {
        value: "breakfast food on kitchen table, fresh croissants, coffee cups, fruit bowl, morning breakfast setting",
        labelKey: "wizard.options.fruehstueck",
        germanLabel: "Frühstück",
        group: "wizard.optionGroups.essenTrinken",
      },
    ],
    icon: <FaLeaf className="w-full h-full text-red-600" />,
  },
];

/* ─── Kitchen Layout Options (sub-selection for kind=kueche) ─── */

export const kitchenLayoutOptions: WizardOption[] = [
  {
    value: "kuechenzeile",
    labelKey: "wizard.options.kuechenzeile",
    germanLabel: "Küchenzeile",
    englishLabel: "galley kitchen, straight kitchen layout",
    image: "/wizard-presets/layout-kuechenzeile.jpg",
  },
  {
    value: "kuecheninsel",
    labelKey: "wizard.options.kuecheninsel",
    germanLabel: "Küche mit Kücheninsel",
    englishLabel: "kitchen with a central island",
    image: "/wizard-presets/layout-kuecheninsel.jpg",
  },
  {
    value: "kueche-ueber-eck",
    labelKey: "wizard.options.kuecheUeberEck",
    germanLabel: "Küche über Eck",
    englishLabel: "L-shaped corner kitchen",
    image: "/wizard-presets/layout-kueche-ueber-eck.jpg",
  },
];
