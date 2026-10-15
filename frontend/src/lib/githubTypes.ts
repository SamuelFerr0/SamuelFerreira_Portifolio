export type Share = { name: string; percent: number };

export type Commit = { repo: string; message: string; date: string };

export type PerfilUser = {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  createdAt: string | null;
};

export type PerfilData = { user: PerfilUser; repos: number; stars: number; forks: number };
