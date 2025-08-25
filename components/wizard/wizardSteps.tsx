import {
  FaHome,
  FaRegClock,
  FaTree,
  FaMapMarkerAlt,
  FaPalette,
  FaCouch,
  FaSun,
  FaLayerGroup,
} from "react-icons/fa"

export const wizardSteps = [
  {
    key: "color",
    label: "Farbe",
    options: [
      { value: "schwarz", label: "Schwarz" },
      { value: "rot", label: "Rot" },
      { value: "burgunderrot", label: "Burgunderrot" },
      { value: "weiß", label: "Weiß" },
      { value: "holz", label: "Holz" },
      { value: "dunkles holz", label: "Dunkles Holz" },
    ],
    icon: <FaPalette className="w-full h-full text-red-400" />,
  },
  {
    key: "style",
    label: "Stil",
    options: [
      { value: "elegant", label: "Elegant" },
      { value: "modern", label: "Modern" },
      { value: "minimalistisch", label: "Minimalistisch" },
      { value: "klassisch", label: "Klassisch" },
    ],
    icon: <FaCouch className="w-full h-full text-red-400" />,
  },
  {
    key: "kitchenLook",
    label: "Aussehen",
    options: [
      { value: "modern", label: "Modern" },
      { value: "offen", label: "Offen" },
      { value: "luxuriös", label: "Luxuriös" },
      { value: "kompakt", label: "Kompakt" },
    ],
    icon: <FaLayerGroup className="w-full h-full text-red-400" />,
  },
  {
    key: "environment",
    label: "Umgebung",
    options: [
      { value: "stilvoll", label: "Stilvoll" },
      { value: "modern", label: "Modern" },
      { value: "urban", label: "Urban" },
      { value: "naturnah", label: "Naturnah" },
    ],
    icon: <FaTree className="w-full h-full text-red-400" />,
  },
  {
    key: "location",
    label: "Standort",
    options: [
      {
        value: "ein Strand auf Gran Canaria",
        label: "Ein Strand auf Gran Canaria",
      },
      { value: "in den Bergen", label: "In den Bergen" },
      { value: "am Stadtrand", label: "Am Stadtrand" },
      { value: "am See", label: "Am See" },
    ],
    icon: <FaMapMarkerAlt className="w-full h-full text-red-400" />,
  },
  {
    key: "time",
    label: "Tageszeit",
    options: [
      { value: "Sonnenaufgang", label: "Sonnenaufgang" },
      { value: "Nachmittag", label: "Nachmittag" },
      { value: "Abend", label: "Abend" },
      { value: "Sonnenuntergang", label: "Sonnenuntergang" },
      { value: "Nacht", label: "Nacht" },
    ],
    icon: <FaRegClock className="w-full h-full text-red-400" />,
  },
  {
    key: "houseType",
    label: "Haustyp",
    options: [
      {
        value: "modernes Holzhaus mit großen Fenstern",
        label: "Modernes Holzhaus mit großen Fenstern",
      },
      { value: "Stadtwohnung", label: "Stadtwohnung" },
      { value: "Loft", label: "Loft" },
      { value: "Landhaus", label: "Landhaus" },
    ],
    icon: <FaHome className="w-full h-full text-red-400" />,
  },
  {
    key: "background",
    label: "Hintergrund",
    options: [
      { value: "Ozean, Strand und Palmen", label: "Ozean, Strand und Palmen" },
      { value: "Berge", label: "Berge" },
      { value: "Wald", label: "Wald" },
      { value: "Stadtpanorama", label: "Stadtpanorama" },
    ],
    icon: <FaSun className="w-full h-full text-red-400" />,
  },
]
