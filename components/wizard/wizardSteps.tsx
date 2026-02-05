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
  germanLabel: string; // German label for AI prompt generation (always German for Replicate model)
  hintKey?: string;  // Translation key for hint
  image?: string;
  group?: string;
};

export type WizardStepDefinition = {
  key: string;
  labelKey: string;       // Translation key
  descriptionKey: string; // Translation key
  options: WizardOption[];
  icon: ReactNode;
  multiSelect?: boolean;
  optionGroupKeys?: string[]; // Translation keys for groups
};

export const wizardSteps: WizardStepDefinition[] = [
  {
    key: "kind",
    labelKey: "wizard.steps.kind.label",
    descriptionKey: "wizard.steps.kind.description",
    options: [
      {
        value: "kueche",
        labelKey: "wizard.options.kueche",
        germanLabel: "Küche",
        hintKey: "wizard.hints.standard",
        image: "/wizard-presets/kind-kueche.jpg",
      },
      {
        value: "wohnzimmer",
        labelKey: "wizard.options.wohnzimmer",
        germanLabel: "Wohnzimmer",
        image: "/wizard-presets/kind-wohnzimmer.jpg",
      },
      {
        value: "from the outside",
        labelKey: "wizard.options.fromTheOutside",
        germanLabel: "von Außen",
        image: "/wizard-presets/kind-aussen.jpg",
      },
      {
        value: "flur",
        labelKey: "wizard.options.flur",
        germanLabel: "Flur",
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
      { value: "schwarz", labelKey: "wizard.options.schwarz", germanLabel: "Schwarz" },
      { value: "rot", labelKey: "wizard.options.rot", germanLabel: "Rot" },
      { value: "burgunderrot", labelKey: "wizard.options.burgunderrot", germanLabel: "Burgunderrot" },
      { value: "weiß", labelKey: "wizard.options.weiss", germanLabel: "Weiß" },
      { value: "holz", labelKey: "wizard.options.holz", germanLabel: "Holz" },
      { value: "dunkles holz", labelKey: "wizard.options.dunklesHolz", germanLabel: "Dunkles Holz" },
    ],
    icon: <FaPalette className="w-full h-full text-red-600" />,
  },
  {
    key: "style",
    labelKey: "wizard.steps.style.label",
    descriptionKey: "wizard.steps.style.description",
    options: [
      {
        value: "modern",
        labelKey: "wizard.options.modern",
        germanLabel: "Modern",
        image: "/wizard-presets/style-modern.jpg",
      },
      {
        value: "zeitlos",
        labelKey: "wizard.options.zeitlos",
        germanLabel: "Zeitlos",
        image: "/wizard-presets/style-zeitlos.jpg",
      },
      {
        value: "natürlich",
        labelKey: "wizard.options.natuerlich",
        germanLabel: "Natürlich",
        image: "/wizard-presets/style-natuerlich.jpg",
      },
      {
        value: "urban",
        labelKey: "wizard.options.urban",
        germanLabel: "Urban",
        image: "/wizard-presets/style-urban.jpg",
      },
      {
        value: "elegant",
        labelKey: "wizard.options.elegant",
        germanLabel: "Elegant",
        image: "/wizard-presets/style-elegant.jpg",
      },
      {
        value: "kreativ",
        labelKey: "wizard.options.kreativ",
        germanLabel: "Kreativ",
        image: "/wizard-presets/style-kreativ.jpg",
      },
      {
        value: "puristisch",
        labelKey: "wizard.options.puristisch",
        germanLabel: "Puristisch",
        image: "/wizard-presets/style-puristisch.jpg",
      },
      {
        value: "gemütlich",
        labelKey: "wizard.options.gemuetlich",
        germanLabel: "Gemütlich",
        image: "/wizard-presets/style-gemuetlich.jpg",
      },
      {
        value: "minimalistisch",
        labelKey: "wizard.options.minimalistisch",
        germanLabel: "Minimalistisch",
        image: "/wizard-presets/style-minimalistisch.jpg",
      },
    ],
    icon: <FaCouch className="w-full h-full text-red-600" />,
  },
  {
    key: "environment",
    labelKey: "wizard.steps.environment.label",
    descriptionKey: "wizard.steps.environment.description",
    options: [
      { value: "stilvoll", labelKey: "wizard.options.stilvoll", germanLabel: "Stilvoll" },
      { value: "modern", labelKey: "wizard.options.modern", germanLabel: "Modern" },
      { value: "urban", labelKey: "wizard.options.urban", germanLabel: "Urban" },
      { value: "naturnah", labelKey: "wizard.options.naturnah", germanLabel: "Naturnah" },
    ],
    icon: <FaTree className="w-full h-full text-red-600" />,
  },
  {
    key: "viewpoint",
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
      {
        value: "shallow depth of field, bokeh background",
        labelKey: "wizard.options.geringeTiefenschaerfe",
        germanLabel: "Geringe Tiefenschärfe",
        image: "/wizard-presets/viewpoint-shallow-dof.jpg",
      },
      {
        value: "deep depth of field, everything in focus",
        labelKey: "wizard.options.tiefenschaerfe",
        germanLabel: "Tiefenschärfe",
        image: "/wizard-presets/viewpoint-deep-dof.jpg",
      },
      {
        value: "soft focus, dreamy blur",
        labelKey: "wizard.options.weicherFokus",
        germanLabel: "Weicher Fokus",
        image: "/wizard-presets/viewpoint-soft-focus.jpg",
      },
    ],
    icon: <FaEye className="w-full h-full text-red-600" />,
  },
  {
    key: "time",
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
    icon: <FaClock className="w-full h-full text-red-600" />,
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
    optionGroupKeys: ["wizard.optionGroups.pflanzen", "wizard.optionGroups.dekoration"],
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
    ],
    icon: <FaLeaf className="w-full h-full text-red-600" />,
  },
];
