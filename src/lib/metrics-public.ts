/**
 * The visibility score's constants, in a module the browser can import.
 *
 * These live here rather than inside metrics.ts so the public page that
 * documents the formula reads the same numbers the dashboard computes with.
 * If someone retunes the weights, the published methodology changes in the
 * same commit — which is the only way a "here is exactly how we score you"
 * page stays true a year later.
 */

/** Relative contribution of each component. Must sum to 1. */
export const WEIGHT_TABLE = { mention: 0.5, citation: 0.3, position: 0.2 } as const;

/**
 * Credit for being named first, second, third and so on. Being named at all
 * is what matters most, so the decay is gentle at the top and flattens into a
 * floor rather than falling to zero — appearing sixth is still appearing.
 */
export const POSITION_CREDIT = [1, 0.85, 0.7, 0.55, 0.4] as const;

/** Anything beyond the table above. */
export const POSITION_CREDIT_FLOOR = 0.25;
