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

export type Player = { id: SectionId; number: number; live: boolean };

export const liveEnabled = Boolean(import.meta.env.VITE_API_URL);

export const formation: Player[][] = [
  [
    { id: "habilidades", number: 9, live: false },
    { id: "projetos", number: 10, live: false },
    { id: "livro", number: 11, live: true },
  ],
  [
    { id: "wakatime", number: 6, live: true },
    { id: "linguagens", number: 7, live: true },
    { id: "atividade", number: 8, live: true },
  ],
  [
    { id: "sobre", number: 2, live: false },
    { id: "formacao", number: 3, live: false },
    { id: "curriculo", number: 4, live: false },
    { id: "experiencias", number: 5, live: false },
  ],
  [{ id: "contato", number: 1, live: false }],
];

export const players: Player[] = formation.flat().sort((a, b) => a.number - b.number);

export function isSectionId(value: string): value is SectionId {
  return players.some((player) => player.id === value);
}
