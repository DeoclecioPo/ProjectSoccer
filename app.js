const STORAGE_KEY = "project_soccer_career_v1";
const MAX_SEASONS = 25;
const MAX_STAT = 99;
const MIN_STAT = 40;

const clubs = [
  "Flamengo",
  "Palmeiras",
  "Corinthians",
  "São Paulo",
  "Cruzeiro",
  "Atlético-MG",
  "Internacional",
  "Grêmio",
  "Santos",
  "Vasco",
  "Botafogo",
  "Athletico-PR",
  "Bahia",
  "Fortaleza",
  "Fluminense",
  "Ceará"
];

const positionProfiles = {
  linha: {
    label: "Linha",
    stats: ["Velocidade", "Drible", "Passe", "Finalização", "Força", "Resistência", "Visão"]
  },
  goleiro: {
    label: "Goleiro",
    stats: ["Reflexo", "Posicionamento", "Agilidade", "Saída", "Força", "Reposição", "Comando"]
  }
};

const elements = {
  creationSection: document.getElementById("creationSection"),
  careerSection: document.getElementById("careerSection"),
  creationForm: document.getElementById("creationForm"),
  playerClub: document.getElementById("playerClub"),
  newCareerBtn: document.getElementById("newCareerBtn"),
  careerPlayerName: document.getElementById("careerPlayerName"),
  careerMeta: document.getElementById("careerMeta"),
  seasonYear: document.getElementById("seasonYear"),
  seasonAge: document.getElementById("seasonAge"),
  seasonClub: document.getElementById("seasonClub"),
  statsList: document.getElementById("statsList"),
  xpAvailable: document.getElementById("xpAvailable"),
  trainBtn: document.getElementById("trainBtn"),
  playMatchBtn: document.getElementById("playMatchBtn"),
  endSeasonBtn: document.getElementById("endSeasonBtn"),
  matchesPlayed: document.getElementById("matchesPlayed"),
  playerForm: document.getElementById("playerForm"),
  playerRating: document.getElementById("playerRating"),
  eventLog: document.getElementById("eventLog"),
  offersList: document.getElementById("offersList"),
  historyList: document.getElementById("historyList"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalDescription: document.getElementById("modalDescription"),
  modalOptions: document.getElementById("modalOptions"),
  modalClose: document.getElementById("modalClose")
};

let career = null;

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const calculateRating = (stats) => {
  const values = Object.values(stats);
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
};

const generateStats = (positionKey) => {
  const profile = positionProfiles[positionKey];
  return profile.stats.reduce((acc, stat) => {
    acc[stat] = randomBetween(MIN_STAT, MIN_STAT + 20);
    return acc;
  }, {});
};

const updateStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(career));
};

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const logEvent = (message) => {
  const entry = document.createElement("p");
  entry.textContent = `• ${message}`;
  elements.eventLog.prepend(entry);
};

const renderStats = () => {
  elements.statsList.innerHTML = "";
  Object.entries(career.stats).forEach(([stat, value]) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const label = document.createElement("div");
    label.innerHTML = `<strong>${stat}</strong><span class="muted">${value}</span>`;
    label.style.display = "flex";
    label.style.justifyContent = "space-between";
    label.style.gap = "12px";

    const button = document.createElement("button");
    button.textContent = "+";
    button.disabled = career.xp === 0 || value >= MAX_STAT;
    button.addEventListener("click", () => increaseStat(stat));

    row.append(label, button);
    elements.statsList.appendChild(row);
  });
};

const renderCareer = () => {
  elements.careerPlayerName.textContent = career.name;
  elements.careerMeta.textContent = `${career.positionLabel} • Início aos ${career.startAge} anos`;
  elements.seasonYear.textContent = career.season;
  elements.seasonAge.textContent = career.age;
  elements.seasonClub.textContent = career.club;
  elements.matchesPlayed.textContent = career.matchesPlayed;
  elements.playerForm.textContent = career.form;
  elements.playerRating.textContent = career.rating;
  elements.xpAvailable.textContent = career.xp;
  renderStats();
  renderOffers();
  renderHistory();
};

const renderOffers = () => {
  elements.offersList.innerHTML = "";
  if (!career.offers.length) {
    elements.offersList.innerHTML = "<p class=\"muted\">Nenhuma oferta disponível no momento.</p>";
    return;
  }
  career.offers.forEach((offer) => {
    const card = document.createElement("div");
    card.className = "offer-card";
    const info = document.createElement("div");
    info.innerHTML = `<strong>${offer.club}</strong><p class="muted">Projeto: ${offer.project}</p>`;

    const button = document.createElement("button");
    button.textContent = "Aceitar";
    button.addEventListener("click", () => acceptOffer(offer.club));
    card.append(info, button);
    elements.offersList.appendChild(card);
  });
};

const renderHistory = () => {
  elements.historyList.innerHTML = "";
  career.history.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>Temporada ${entry.season}</strong> — ${entry.summary}`;
    elements.historyList.prepend(item);
  });
};

const startCareer = (data) => {
  const stats = generateStats(data.position);
  career = {
    name: data.name,
    startAge: data.age,
    age: data.age,
    position: data.position,
    positionLabel: positionProfiles[data.position].label,
    club: data.club,
    season: 1,
    stats,
    xp: 8,
    matchesPlayed: 0,
    form: "Neutro",
    rating: calculateRating(stats),
    history: [],
    offers: []
  };
  updateStorage();
  logEvent("Carreira iniciada! Boa sorte na temporada 1.");
  showCareer();
};

const showCareer = () => {
  elements.creationSection.classList.add("hidden");
  elements.careerSection.classList.remove("hidden");
  renderCareer();
};

const showCreation = () => {
  elements.creationSection.classList.remove("hidden");
  elements.careerSection.classList.add("hidden");
};

const increaseStat = (stat) => {
  if (career.xp <= 0 || career.stats[stat] >= MAX_STAT) {
    return;
  }
  career.stats[stat] += 1;
  career.xp -= 1;
  career.rating = calculateRating(career.stats);
  updateStorage();
  renderCareer();
  logEvent(`Treino específico: ${stat} aumentou para ${career.stats[stat]}.`);
};

const train = () => {
  if (!career || !career.stats) {
    logEvent("Crie uma carreira antes de treinar.");
    return;
  }

  const statKeys = Object.keys(career.stats);
  if (statKeys.length === 0) {
    logEvent("Nenhum atributo disponível para treino.");
    return;
  }
  elements.modalTitle.textContent = "Sessão de Treino";
  elements.modalDescription.textContent = "Escolha um atributo para receber +2 de XP.";
  elements.modalOptions.innerHTML = "";

  statKeys.forEach((stat) => {
    const button = document.createElement("button");
    button.textContent = stat;
    button.addEventListener("click", () => {
      const gain = career.stats[stat] >= MAX_STAT ? 0 : 2;
      career.stats[stat] = Math.min(MAX_STAT, career.stats[stat] + gain);
      career.xp += 1;
      career.rating = calculateRating(career.stats);
      updateStorage();
      renderCareer();
      logEvent(`Treino concluído! ${stat} +${gain}, XP +1.`);
      closeModal();
    });
    elements.modalOptions.appendChild(button);
  });

  openModal();
};

const simulateMatch = () => {
  const performanceRoll = randomBetween(1, 100);
  const ratingBoost = career.rating + randomBetween(-10, 10);
  const success = performanceRoll + ratingBoost / 2;

  career.matchesPlayed += 1;

  if (success > 85) {
    career.xp += 4;
    career.form = "Excelente";
    logEvent("Partida brilhante! Você foi destaque e ganhou +4 XP.");
  } else if (success > 70) {
    career.xp += 3;
    career.form = "Boa";
    logEvent("Boa partida! +3 XP.");
  } else if (success > 55) {
    career.xp += 2;
    career.form = "Neutro";
    logEvent("Partida ok. +2 XP.");
  } else if (success > 40) {
    career.xp += 1;
    career.form = "Irregular";
    logEvent("Partida fraca. +1 XP.");
  } else {
    career.form = "Ruim";
    logEvent("Partida ruim. Sem XP ganho.");
  }

  updateStorage();
  renderCareer();
};

const generateOffers = () => {
  const availableClubs = clubs.filter((club) => club !== career.club);
  const offerCount = Math.min(3, randomBetween(1, 3));
  career.offers = [];

  for (let i = 0; i < offerCount; i += 1) {
    const club = availableClubs.splice(randomBetween(0, availableClubs.length - 1), 1)[0];
    const project = career.rating > 75 ? "Time brigando por títulos" : "Projeto em crescimento";
    career.offers.push({ club, project });
  }
};

const endSeason = () => {
  if (career.season >= MAX_SEASONS) {
    logEvent("Fim de carreira! Obrigado por jogar.");
    return;
  }

  const summary = `Clube: ${career.club}. Jogos: ${career.matchesPlayed}. Rating: ${career.rating}. Forma: ${career.form}.`;
  career.history.push({ season: career.season, summary });

  career.season += 1;
  career.age += 1;
  career.matchesPlayed = 0;
  career.form = "Neutro";
  career.xp += 6;

  generateOffers();
  updateStorage();
  renderCareer();
  logEvent(`Temporada encerrada. Nova temporada ${career.season} iniciada.`);
};

const acceptOffer = (club) => {
  career.club = club;
  career.offers = [];
  updateStorage();
  renderCareer();
  logEvent(`Transferência concluída: agora você joga no ${club}.`);
};

const openModal = () => {
  elements.modal.classList.remove("hidden");
};

const closeModal = () => {
  elements.modal.classList.add("hidden");
};

const loadCareer = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }
  career = JSON.parse(saved);
  renderCareer();
  showCareer();
};

const resetCareer = () => {
  career = null;
  clearStorage();
  elements.eventLog.innerHTML = "";
  elements.offersList.innerHTML = "";
  elements.historyList.innerHTML = "";
  closeModal();
  showCreation();
};

const populateClubs = () => {
  elements.playerClub.innerHTML = "";
  clubs.forEach((club) => {
    const option = document.createElement("option");
    option.value = club;
    option.textContent = club;
    elements.playerClub.appendChild(option);
  });
};

const attachEvents = () => {
  elements.creationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("playerName").value.trim();
    const age = Number(document.getElementById("playerAge").value);
    const position = document.getElementById("playerPosition").value;
    const club = document.getElementById("playerClub").value;

    if (!name) {
      return;
    }

    startCareer({ name, age, position, club });
  });

  elements.trainBtn.addEventListener("click", train);
  elements.playMatchBtn.addEventListener("click", simulateMatch);
  elements.endSeasonBtn.addEventListener("click", endSeason);
  elements.modalClose.addEventListener("click", closeModal);
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  elements.newCareerBtn.addEventListener("click", () => {
    resetCareer();
  });
};

populateClubs();
attachEvents();
loadCareer();
