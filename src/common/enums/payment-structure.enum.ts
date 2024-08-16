export const PAYMENTSTRUCTURE = {
  lump_sum: "lump_sum",
  per_specification: "per_specification"
} as const;

export type PAYMENTSTRUCTURETYPE =
  (typeof PAYMENTSTRUCTURE)[keyof typeof PAYMENTSTRUCTURE];
