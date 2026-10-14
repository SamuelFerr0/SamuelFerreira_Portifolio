import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const pt = {
  app: {
    name: "Samuel Ferreira Guimarães",
    role: "Estudante de Engenharia de Software na PUC Minas",
    goal: "Buscando o primeiro estágio em desenvolvimento.",
    hint: "Escolha um jogador para abrir uma seção.",
    legend: "Borda tracejada: dados ao vivo",
    vila: "Vila Belmiro · Meninos da Vila",
    camisa: "Camisa",
    camisas: { jogo: "Jogo", treino: "Treino" },
    back: "Voltar ao campo",
    lang: "Idioma",
    loading: "Carregando…",
    failed:
      "Não foi possível carregar agora. O servidor pode estar acordando; tente de novo em um minuto.",
    empty: "Nada para mostrar ainda.",
    menu: "Menu principal",
    shortcuts: "Links rápidos",
  },
  nav: {
    projetos: "Projetos",
    habilidades: "Habilidades",
    wakatime: "WakaTime",
    linguagens: "Linguagens",
    atividade: "Atividade",
    sobre: "Sobre mim",
    formacao: "Formação",
    curriculo: "Currículo",
    contato: "Contato",
    home: "Início",
    experiencias: "Experiências",
    livro: "Livro de visitas",
  },
  sobre: {
    avatarAlt: "Foto de Samuel Ferreira Guimarães",
    ver: "Ver {{name}}",
    hojeTitulo: "Hoje",
    hoje: { em: "em" },
    disciplinasTitulo: "Disciplinas",
    pessoalTitulo: "Fora do computador",
    kpi: { projetos: "projetos", habilidades: "habilidades", certificados: "certificados" },
    chips: {
      periodo: "2º período",
      estagio: "Buscando estágio em desenvolvimento",
    },
    p1: "Estou no segundo período de Engenharia de Software na PUC Minas, aprendendo a construir coisas de verdade, não só a decorar sintaxe.",
    p2: "Gosto de projetos que resolvem um problema concreto: um mapa que aponta o setor mais perigoso de um estádio, um site que organiza estatísticas de futebol, um jogo que ensina lógica de defesa. Cada repositório no meu GitHub é uma prática nova.",
    p3: "Sou santista e o site tem esse clima: o campo é a Vila Belmiro, a camisa 10 é dos Projetos e o rodapé é dos Meninos da Vila.",
    items: {
      formacao: {
        label: "Formação",
        text: "Engenharia de Software na PUC Minas, no 2º período.",
      },
      area: {
        label: "Área de atuação",
        text: "Desenvolvimento web: front-end com HTML, CSS, JavaScript e React (em aprendizado) e back-end com Java e Spring Boot.",
      },
      interesses: {
        label: "Interesses",
        text: "Projetos que resolvem problemas concretos, como segurança em estádios, estatísticas de futebol e jogos, e construir aplicações do front-end ao back-end.",
      },
      objetivos: {
        label: "Objetivos",
        text: "Conseguir o primeiro estágio em desenvolvimento e crescer como engenheiro de software.",
      },
    },
  },
  formacao: {
    course: "Engenharia de Software",
    school: "PUC Minas",
    period: "fev 2026 a dez 2030, em andamento",
    text: "Formação em desenvolvimento de software, atualmente no 2º período. Prática constante com projetos pessoais em paralelo às disciplinas.",
    certificates: "Certificados e cursos",
  },
  curriculo: {
    text: "Currículo em PDF com formação, projetos e contato.",
    baixar: "Baixar currículo (PDF)",
    arquivo: "Curriculo-Samuel-Ferreira-Guimaraes.pdf",
    abrir: "Abrir em outra aba",
    paginas_one: "{{count}} página",
    paginas_other: "{{count}} páginas",
    zoom: "Zoom",
    zoom_menos: "Diminuir zoom",
    zoom_mais: "Aumentar zoom",
    zoom_ajustar: "Ajustar à largura",
    carregando: "Carregando o currículo…",
    erro: "Não foi possível mostrar o currículo aqui. Use os botões para baixar ou abrir o PDF.",
  },
  projetos: {
    repo: "Ver repositório",
    all: "Todos os repositórios no GitHub",
    text: "Linha do tempo dos projetos, do mais antigo ao mais recente.",
    imageAlt: "Projeto {{name}} em funcionamento",
    secure_proj_title: "Secure+",
    secure_proj_desc:
      "Projeto em equipe (5 integrantes): plataforma web de segurança pública para estádios esportivos, com mapa interativo que destaca o setor com mais denúncias e dados atualizados via API. Minhas contribuições: design system único, refatoração de estilos e scripts inline para arquivos externos em 11 páginas e correção de bugs de perfil e carrossel.",
    footscore_proj_title: "Footscore",
    footscore_proj_desc:
      "Site de estatísticas de times de futebol, com cards interativos por equipe que mostram resultados recentes e próximos jogos.",
    castle_proj_title: "Defend the Castle",
    castle_proj_desc:
      "Jogo 2D feito em equipe (4 integrantes), com lógica de defesa de torre (tower defense) em Python.",
    clima_proj_title: "ClimaAPI",
    clima_proj_desc:
      "API REST em Spring Boot que consulta o clima atual e a previsão do tempo na OpenWeatherMap.",
    githubTitle: "Mais projetos no GitHub",
    githubText: "Repositórios públicos, do mais antigo ao mais recente, direto do GitHub.",
    carregando: "Carregando repositórios…",
    nenhum: "Nenhum repositório público encontrado.",
    limite: "O GitHub limitou as consultas por enquanto. Tente de novo mais tarde.",
    erro: "Não foi possível carregar os repositórios agora.",
  },
  habilidades: {
    practice: "Na prática",
    learning: "Aprendendo",
    hint: "Arraste o globo para girar.",
    noGithub: "{{name}} no GitHub",
    estilos: "Visualização",
    skins: { cards: "Cards", lista: "Lista", tags: "Tags" },
    nivel: {
      basico: "Básico",
      intermediario: "Intermediário",
      avancado: "Avançado",
    },
  },
  wakatime: {
    text: "Tempo de código registrado pelo WakaTime desde que comecei a usá-lo.",
    estilos: "Visualização",
    skins: { barras: "Barras", grade: "Grade", lista: "Lista" },
    daily: "Média diária: {{value}}",
    days: "{{active}} dias ativos de {{total}}",
    since: "Desde {{date}}",
    languages: "Linguagens",
    editors: "Editores",
    categories: "Categorias",
    systems: "Sistemas operacionais",
    more: "+ {{count}} outros ({{time}}, {{percent}})",
    agora: {
      ativo: "Codando agora",
      inativo: "Sem atividade agora",
      privado: "em um projeto privado",
      em: "em {{projeto}}",
      branch: "branch {{branch}}",
      sessao: "sessão de {{tempo}}",
      ultima: "última atividade {{quando}}",
      hoje: "hoje: {{tempo}}",
      ha: {
        instantes: "agora há pouco",
        minutos: "há {{n}} min",
        horas: "há {{n}} h",
      },
    },
  },
  linguagens: {
    text: "Linguagens mais usadas nos meus repositórios públicos, por volume de código.",
  },
  atividade: {
    text: "Últimos commits nos meus repositórios atualizados mais recentemente.",
  },
  contato: {
    text: "Aberto a oportunidades de estágio em desenvolvimento.",
    assuntoConfirmacao: "Recebemos sua mensagem!",
    name: "Nome",
    email: "Seu e-mail",
    message: "Mensagem",
    send: "Enviar mensagem",
    sending: "Enviando…",
    ok: "Mensagem enviada. Respondo por e-mail.",
    fail: "Não foi possível enviar. Tente de novo ou escreva direto para o e-mail pelo ícone acima.",
    emailLabel: "E-mail",
    errors: {
      name: "Informe seu nome (mínimo 2 letras).",
      email: "Informe um e-mail válido.",
      message: "Escreva uma mensagem com pelo menos 10 caracteres.",
    },
    mailto: "Abrindo seu aplicativo de e-mail para enviar a mensagem.",
    captcha_pendente: "Confirme que você não é um robô antes de enviar.",
    captcha_erro: "Não foi possível carregar o reCAPTCHA. Recarregue a página.",
  },
  experiencias: {
    text: "Ainda não tenho experiência profissional. Esta seção vai ganhar novos cards conforme eu conseguir estágios e outras oportunidades.",
    present: "atual",
    estudo_role: "Estudante de Engenharia de Software",
    estudo_company: "PUC Minas",
    estudo_desc:
      "Graduação em Engenharia de Software, de 2026 até hoje. Estou em busca do meu primeiro estágio em desenvolvimento de software.",
    estudo_skills: "JavaScript, React, Node.js, Java, Spring Boot, Python",
  },
  ask: {
    open: "Pergunte ao técnico",
    title: "Técnico",
    intro:
      "Sou um assistente de IA do portfólio e respondo só com o que está aqui. Posso errar: confirme no currículo.",
    placeholder: "Pergunte sobre projetos ou formação",
    send: "Enviar",
    close: "Fechar",
    thinking: "Pensando…",
    voce: "Você",
    selo: "IA",
    experimente: "Experimente perguntar:",
    sugestoes: [
      "Quais projetos você já fez?",
      "O que você está estudando agora?",
      "Quais tecnologias você usa?",
      "Como posso falar com você?",
    ],
    erros: {
      limite:
        "Muitas perguntas por agora. Tente de novo mais tarde ou use o formulário de contato.",
      limite_espera:
        "Muitas perguntas por agora. Tente de novo em {{minutos}} min ou use o formulário de contato.",
      limite_ia: "O assistente está sobrecarregado. Tente de novo em um minuto.",
      falha_ia: "Não consegui responder agora. Tente de novo em um minuto.",
      sem_chave: "O assistente ainda não está configurado.",
      indisponivel:
        "Não consegui responder agora. O servidor pode estar acordando; tente de novo em um minuto.",
      rede: "Sem conexão com o servidor. Confira a internet e tente de novo.",
      vazia: "O assistente não devolveu resposta. Tente reformular a pergunta.",
      pergunta_longa: "A pergunta está longa demais. Resuma e tente de novo.",
      pergunta_vazia: "Escreva uma pergunta primeiro.",
    },
  },
  stats: {
    perfil: { desde: "no GitHub desde {{ano}}" },
    indicadores: {
      repositorios: "Repositórios",
      estrelas: "Estrelas",
      forks: "Forks",
      seguidores: "Seguidores",
    },
    notas: {
      publicos: "públicos",
      emRepos: "em {{count}} repositórios",
      seguindo: "seguindo {{valor}}",
    },
  },
  tema: {
    grupo: "Tema",
    ativar_claro: "Ativar tema branco",
    ativar_escuro: "Ativar tema preto",
  },
  visitas: {
    total_one: "{{count, number}} visita",
    total_other: "{{count, number}} visitas",
  },
  livro: {
    text: "Deixe um recado de passagem. As mensagens aparecem aqui para todo mundo.",
    name: "Seu nome",
    message: "Mensagem",
    send: "Assinar o livro",
    sending: "Enviando…",
    ok: "Obrigado pelo recado!",
    fail: "Não foi possível enviar agora. O servidor pode estar acordando; tente de novo em um minuto.",
    limite: "Muitas mensagens por agora. Tente de novo mais tarde.",
    vazio: "Ninguém assinou ainda. Seja a primeira pessoa!",
    errors: {
      name: "Informe seu nome (2 a 40 letras).",
      message: "Escreva uma mensagem de 3 a 300 caracteres.",
    },
  },
};

const english: typeof pt = {
  app: {
    name: "Samuel Ferreira Guimarães",
    role: "Software Engineering student at PUC Minas",
    goal: "Looking for my first software development internship.",
    hint: "Pick a player to open a section.",
    legend: "Dashed outline: live data",
    vila: "Vila Belmiro · Meninos da Vila",
    camisa: "Kit",
    camisas: { jogo: "Match", treino: "Training" },
    back: "Back to the pitch",
    lang: "Language",
    loading: "Loading…",
    failed: "Could not load right now. The server may be waking up; try again in a minute.",
    empty: "Nothing to show yet.",
    menu: "Main menu",
    shortcuts: "Quick links",
  },
  nav: {
    projetos: "Projects",
    habilidades: "Skills",
    wakatime: "WakaTime",
    linguagens: "Languages",
    atividade: "Activity",
    sobre: "About me",
    formacao: "Education",
    curriculo: "Résumé",
    contato: "Contact",
    home: "Home",
    experiencias: "Experience",
    livro: "Guestbook",
  },
  sobre: {
    avatarAlt: "Photo of Samuel Ferreira Guimarães",
    ver: "See {{name}}",
    hojeTitulo: "Today",
    hoje: { em: "at" },
    disciplinasTitulo: "Courses",
    pessoalTitulo: "Away from the computer",
    kpi: { projetos: "projects", habilidades: "skills", certificados: "certificates" },
    chips: {
      periodo: "2nd semester",
      estagio: "Looking for a development internship",
    },
    p1: "I'm in my second semester of Software Engineering at PUC Minas, and I'm here to build real things, not just memorize syntax.",
    p2: "I like projects that solve a concrete problem: a map that flags the riskiest sector of a stadium, a site that organizes football stats, a game built around defense logic. Each repo on my GitHub is another round of practice.",
    p3: "I'm a Santos fan, and the site shows it: the pitch is Vila Belmiro, the number 10 shirt goes to Projects, and the footer is a nod to the Meninos da Vila.",
    items: {
      formacao: {
        label: "Education",
        text: "Software Engineering at PUC Minas, currently in the 2nd semester.",
      },
      area: {
        label: "Field",
        text: "Web development: front end with HTML, CSS, JavaScript and React (still learning it), and back end with Java and Spring Boot.",
      },
      interesses: {
        label: "Interests",
        text: "Projects that solve concrete problems, like stadium safety, football stats and games, and building applications from front end to back end.",
      },
      objetivos: {
        label: "Goals",
        text: "Land my first software development internship and grow as an engineer.",
      },
    },
  },
  formacao: {
    course: "Software Engineering",
    school: "PUC Minas",
    period: "Feb 2026 to Dec 2030, in progress",
    text: "Software engineering degree, now in the 2nd semester. I practice constantly with personal projects alongside classes.",
    certificates: "Certificates and courses",
  },
  curriculo: {
    text: "My résumé as a PDF, with education, projects and contact details.",
    baixar: "Download résumé (PDF)",
    arquivo: "Resume-Samuel-Ferreira-Guimaraes.pdf",
    abrir: "Open in a new tab",
    paginas_one: "{{count}} page",
    paginas_other: "{{count}} pages",
    zoom: "Zoom",
    zoom_menos: "Zoom out",
    zoom_mais: "Zoom in",
    zoom_ajustar: "Fit to width",
    carregando: "Loading the résumé…",
    erro: "Could not show the résumé here. Use the buttons to download or open the PDF.",
  },
  projetos: {
    repo: "View repository",
    all: "All repositories on GitHub",
    text: "Projects timeline, oldest to newest.",
    imageAlt: "{{name}} project in action",
    secure_proj_title: "Secure+",
    secure_proj_desc:
      "Team project (5 members): a public safety web platform for sports stadiums, with an interactive map that highlights the sector with the most reports and data refreshed through an API. My part: a unified design system, moving inline styles and scripts into external files across 11 pages, and fixing profile and carousel bugs.",
    footscore_proj_title: "Footscore",
    footscore_proj_desc:
      "Football stats site with an interactive card for each team, showing recent results and upcoming matches.",
    castle_proj_title: "Defend the Castle",
    castle_proj_desc:
      "2D tower defense game built by a team of 4, with the defense logic written in Python.",
    clima_proj_title: "ClimaAPI",
    clima_proj_desc:
      "Spring Boot REST API that pulls current weather and forecasts from OpenWeatherMap.",
    githubTitle: "More projects on GitHub",
    githubText: "My public repositories, oldest to newest, loaded straight from GitHub.",
    carregando: "Loading repositories…",
    nenhum: "No public repositories found.",
    limite: "GitHub is limiting requests right now. Try again later.",
    erro: "Could not load repositories right now.",
  },
  habilidades: {
    practice: "In practice",
    learning: "Learning",
    hint: "Drag the globe to spin it.",
    noGithub: "{{name}} on GitHub",
    estilos: "View",
    skins: { cards: "Cards", lista: "List", tags: "Tags" },
    nivel: {
      basico: "Basic",
      intermediario: "Intermediate",
      avancado: "Advanced",
    },
  },
  wakatime: {
    text: "Coding time tracked by WakaTime since I started using it.",
    estilos: "View",
    skins: { barras: "Bars", grade: "Grid", lista: "List" },
    daily: "Daily average: {{value}}",
    days: "{{active}} active days of {{total}}",
    since: "Since {{date}}",
    languages: "Languages",
    editors: "Editors",
    categories: "Categories",
    systems: "Operating systems",
    more: "+ {{count}} more ({{time}}, {{percent}})",
    agora: {
      ativo: "Coding now",
      inativo: "Not coding right now",
      privado: "on a private project",
      em: "on {{projeto}}",
      branch: "branch {{branch}}",
      sessao: "{{tempo}} session",
      ultima: "last activity {{quando}}",
      hoje: "today: {{tempo}}",
      ha: {
        instantes: "just now",
        minutos: "{{n}} min ago",
        horas: "{{n}} h ago",
      },
    },
  },
  linguagens: {
    text: "Languages I use most across my public repositories, by amount of code.",
  },
  atividade: {
    text: "Latest commits from my most recently updated repositories.",
  },
  contato: {
    text: "Open to software development internship opportunities.",
    assuntoConfirmacao: "Thanks, I got your message!",
    name: "Name",
    email: "Your email",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    ok: "Message sent. I'll reply by email.",
    fail: "Could not send. Try again, or email me directly using the icon above.",
    emailLabel: "Email",
    errors: {
      name: "Enter your name (at least 2 characters).",
      email: "Enter a valid email.",
      message: "Write a message of at least 10 characters.",
    },
    mailto: "Opening your email app to send the message.",
    captcha_pendente: "Please confirm you're not a robot before sending.",
    captcha_erro: "Could not load reCAPTCHA. Reload the page.",
  },
  experiencias: {
    text: "I don't have professional experience yet. This section will grow as I land internships and other opportunities.",
    present: "present",
    estudo_role: "Software Engineering student",
    estudo_company: "PUC Minas",
    estudo_desc:
      "Software Engineering degree, from 2026 to today. I'm looking for my first software development internship.",
    estudo_skills: "JavaScript, React, Node.js, Java, Spring Boot, Python",
  },
  ask: {
    open: "Ask the coach",
    title: "Coach",
    intro:
      "I'm an AI assistant for this portfolio, and I only answer based on what's on it. I can get things wrong, so check the résumé.",
    placeholder: "Ask about projects or education",
    send: "Send",
    close: "Close",
    thinking: "Thinking…",
    voce: "You",
    selo: "AI",
    experimente: "Try asking:",
    sugestoes: [
      "What projects have you built?",
      "What are you studying right now?",
      "Which technologies do you use?",
      "How can I contact you?",
    ],
    erros: {
      limite: "Too many questions for now. Try again later or use the contact form.",
      limite_espera:
        "Too many questions for now. Try again in {{minutos}} min or use the contact form.",
      limite_ia: "The assistant is overloaded right now. Try again in a minute.",
      falha_ia: "I couldn't answer right now. Try again in a minute.",
      sem_chave: "The assistant isn't configured yet.",
      indisponivel:
        "I couldn't answer right now. The server may be waking up; try again in a minute.",
      rede: "Can't reach the server. Check your connection and try again.",
      vazia: "The assistant didn't return an answer. Try rephrasing your question.",
      pergunta_longa: "That question is too long. Shorten it and try again.",
      pergunta_vazia: "Type a question first.",
    },
  },
  stats: {
    perfil: { desde: "on GitHub since {{ano}}" },
    indicadores: {
      repositorios: "Repositories",
      estrelas: "Stars",
      forks: "Forks",
      seguidores: "Followers",
    },
    notas: {
      publicos: "public",
      emRepos: "across {{count}} repositories",
      seguindo: "following {{valor}}",
    },
  },
  tema: {
    grupo: "Theme",
    ativar_claro: "Switch to white theme",
    ativar_escuro: "Switch to black theme",
  },
  visitas: {
    total_one: "{{count, number}} visit",
    total_other: "{{count, number}} visits",
  },
  livro: {
    text: "Leave a note on your way through. Everyone who visits can see it here.",
    name: "Your name",
    message: "Message",
    send: "Sign the guestbook",
    sending: "Sending…",
    ok: "Thanks for the note!",
    fail: "Could not send right now. The server may be waking up; try again in a minute.",
    limite: "Too many messages for now. Try again later.",
    vazio: "No one has signed yet. Be the first!",
    errors: {
      name: "Enter your name (2 to 40 characters).",
      message: "Write a message of 3 to 300 characters.",
    },
  },
};

const resources = {
  en: { translation: english },
  pt: { translation: pt },
};

function languageFromUrl(): "pt" | "en" | null {
  try {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang?.toLowerCase().startsWith("en")) return "en";
    if (lang?.toLowerCase().startsWith("pt")) return "pt";
  } catch {}
  return null;
}

void i18next.use(initReactI18next).init({
  resources,
  lng: languageFromUrl() ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

function setHtmlLang(lng: string) {
  document.documentElement.lang = lng.startsWith("en") ? "en" : "pt-BR";
}

setHtmlLang(i18next.language);
i18next.on("languageChanged", setHtmlLang);

export default i18next;
