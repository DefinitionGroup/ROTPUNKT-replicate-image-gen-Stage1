/**
 * Canonical camera values used by the wizard and prompt pipeline.
 *
 * The former top-down option was a strict 90-degree plan view. Keep accepting
 * its stored value so existing browser sessions do not break, but normalize it
 * to the oblique bird's-eye profile before it reaches the UI or model prompt.
 */
export const DEFAULT_VIEWPOINT = "eye level shot";
export const BIRD_EYE_VIEWPOINT = "high angle shot, bird's eye view";
export const LEGACY_TOP_DOWN_VIEWPOINT = "top-down shot, overhead view";

export function normalizeViewpoint(viewpoint?: string): string | undefined {
  if (!viewpoint) return viewpoint;

  return viewpoint === LEGACY_TOP_DOWN_VIEWPOINT
    ? BIRD_EYE_VIEWPOINT
    : viewpoint;
}
