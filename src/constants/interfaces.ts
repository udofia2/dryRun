import { EXHIBITTYPE } from "@prisma/client";

export const ExhibitType = new Set(Object.values(EXHIBITTYPE));

export enum CLIENTTYPE {
  "individual" = "Individual",
  "company/organization" = "Company/Organization"
}

export enum LOCATIONTYPE {
  "in_person" = "In Person",
  "virtual" = "Virtual",
  "hybrid" = "Hybrid"
}
