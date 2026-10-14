const WAKATIME_CONFIG = {
  API_PATH: "/api/wakatime",
  RANGE: "all_time",
  LIMITS: { languages: 8, editors: 4, categories: 5, operatingSystems: 3 },
  HIDDEN_LANGUAGES: [] as string[],
  AGORA: {
    API_PATH: "/api/codando",
    ATUALIZAR_SEGUNDOS: 60,
  },
};

export default WAKATIME_CONFIG;
