import type { WizardState } from "@/app/store/wizardStore";
import type {
  CookingZoneLocation,
  WetZoneLocation,
} from "@/lib/imageGenerationContract";
import type { WizardOption } from "./wizardSteps";

export const ISLAND_LAYOUT_VALUE = "kuecheninsel";

export type KitchenZoneLocation = "wall_run" | "island";

export const kitchenZoneOptions: WizardOption[] = [
  {
    value: "wall_run",
    labelKey: "wizard.options.zoneWallRun",
    germanLabel: "Wandzeile",
    englishLabel: "wall run",
  },
  {
    value: "island",
    labelKey: "wizard.options.zoneIsland",
    germanLabel: "Kücheninsel",
    englishLabel: "kitchen island",
  },
];

// Most island kitchens keep the sink at the wall and cook on the island.
export const DEFAULT_ISLAND_SINK_LOCATION: KitchenZoneLocation = "wall_run";
export const DEFAULT_ISLAND_COOKTOP_LOCATION: KitchenZoneLocation = "island";

export type ResolvedKitchenZones = {
  hasIsland: boolean;
  // null when the user skipped the layout choice, so no island claim is made.
  islandCount: 0 | 1 | null;
  sinkLocation: WetZoneLocation;
  cooktopLocation: CookingZoneLocation;
};

export function isKitchenZoneLocation(
  value: unknown
): value is KitchenZoneLocation {
  return value === "wall_run" || value === "island";
}

export function hasIslandLayout(
  selections: Pick<WizardState["selectedOptions"], "kind" | "kitchenLook">
): boolean {
  return (
    selections.kind === "kueche" && selections.kitchenLook === ISLAND_LAYOUT_VALUE
  );
}

/**
 * Sink and cooktop placement are only a choice when the layout has an island;
 * every other layout puts both zones on the wall run.
 */
export function resolveKitchenZones(
  selections: Pick<
    WizardState["selectedOptions"],
    "kind" | "kitchenLook" | "sinkLocation" | "cooktopLocation"
  >
): ResolvedKitchenZones {
  const hasIsland = hasIslandLayout(selections);
  if (!hasIsland) {
    return {
      hasIsland,
      islandCount: selections.kitchenLook ? 0 : null,
      sinkLocation: "wall_run",
      cooktopLocation: "wall_run",
    };
  }

  return {
    hasIsland,
    islandCount: 1,
    sinkLocation: isKitchenZoneLocation(selections.sinkLocation)
      ? selections.sinkLocation
      : DEFAULT_ISLAND_SINK_LOCATION,
    cooktopLocation: isKitchenZoneLocation(selections.cooktopLocation)
      ? selections.cooktopLocation
      : DEFAULT_ISLAND_COOKTOP_LOCATION,
  };
}
