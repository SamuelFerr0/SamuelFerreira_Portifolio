import type { SectionId } from "./formation";

export const AVATAR = "/avatar.jpg";

export const secoes = [
  { id: "formacao", to: "formacao" },
  { id: "area", to: "habilidades" },
  { id: "interesses", to: "projetos" },
  { id: "objetivos", to: "contato" },
] as const satisfies readonly { id: string; to: SectionId }[];

export type Texto = { pt: string; en: string };

export type ItemHoje = { id: string; cargo: Texto; org: Texto; detalhe: Texto; url?: string };
export type PeriodoDisciplinas = { periodo: string; itens: string[] };
export type GrupoPessoal = { id: string; rotulo: Texto; itens: Texto[] };

export const hoje: ItemHoje[] = [];
export const disciplinas: PeriodoDisciplinas[] = [];
export const pessoal: GrupoPessoal[] = [
  {
    id: "esporte",
    rotulo: { pt: "Esporte", en: "Sport" },
    itens: [
      { pt: "Jogar futevôlei", en: "Playing footvolley" },
      { pt: "Assistir futebol", en: "Watching football" },
    ],
  },
  {
    id: "lazer",
    rotulo: { pt: "Lazer", en: "Leisure" },
    itens: [
      { pt: "Ler", en: "Reading" },
      { pt: "Assistir séries", en: "Watching TV series" },
      { pt: "Procurar ideias de projetos", en: "Looking for project ideas" },
    ],
  },
];
