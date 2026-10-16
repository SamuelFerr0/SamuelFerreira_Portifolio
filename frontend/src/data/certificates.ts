import type { Texto } from "./sobreData";

export type Certificate = { name: Texto; issuer: string; year: number; hours?: number; url?: string };

export const certificates: Certificate[] = [
  {
    name: { pt: "Introdução à Computação Quântica", en: "Introduction to Quantum Computing" },
    issuer: "PUC Minas (ICEI)",
    year: 2026,
    hours: 30,
  },
];
