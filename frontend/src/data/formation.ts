export type SectionId =
  | "sobre"
  | "projetos"
  | "experiencias"
  | "contato"
  | "formacao"
  | "curriculo"
  | "habilidades"
  | "wakatime"
  | "linguagens"
  | "atividade"
  | "livro";

export type Player = { id: SectionId; number: number };

export const liveEnabled = Boolean(import.meta.env.VITE_API_URL);

export const formation: Player[][] = [
  [
    { id: "habilidades", number: 9 },
    { id: "projetos", number: 10 },
    { id: "livro", number: 11 },
  ],
  [
    { id: "wakatime", number: 6 },
    { id: "linguagens", number: 7 },
    { id: "atividade", number: 8 },
  ],
  [
    { id: "sobre", number: 2 },
    { id: "formacao", number: 3 },
    { id: "curriculo", number: 4 },
    { id: "experiencias", number: 5 },
  ],
  [{ id: "contato", number: 1 }],
];

export const players: Player[] = formation.flat().sort((a, b) => a.number - b.number);

export function isSectionId(value: string): value is SectionId {
  return players.some((player) => player.id === value);
}
