/**
 * Chrome dimensions that both CSS and motion need. The flyout animates its
 * width, and motion can't interpolate a CSS custom property — so the number
 * lives here and CSS reads it from the element, not the other way around.
 */
export const FLYOUT_WIDTH = 340;
