
/* ==========================================
   SPORTPULSE AI — MATCHES ENGINE
========================================== */

const Matches = {
  currentFixtures: [],
  currentFilter: "all",
  filtersInitialized: false,

  getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  getStatus(status) {
    const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"];

    if (["FT", "AET", "PEN"].includes(status)) {
      return { label: "Terminé", type: "finished" };
    }

    if (liveStatuses.includes(status)) {
      return { label: "En direct", type: "live" };
    }

    if (status === "PST") {
      return { label: "Reporté", type: "postponed" };
    }

    if (status === "CANC") {
      return { label: "Annulé", type: "cancelled" };
    }

    return { label: "À venir", type: "upcoming" };
  },

  formatTime(dateString) {
    if (!dateString) return "--:--";

    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris"
    });
  },

  createTeam(name, logo, side) {
    const team = document.createElement("div");
    team.className = `match-team match-team-${side}`;

    const image = document.createElement("img");
    image.className = "match-team-logo";
    image.alt = "";
    image.loading = "lazy";

    if (logo) {
      image.src = logo;
      image.onerror = () => {
        image.style.display = "none";
      };
    } else {
      image.style.display = "none";
    }

    const label = document.createElement("strong");
    label.className = "match-team-name";
    label.textContent = name || "Équipe inconnue";

    team.append(image, label);
    return team;
  },

  createCard(match) {
    const card = document.createElement("article");
    card.className = "dashboard-match-card";

    const league = document.createElement("div");
    league.className = "match-league";

    if (match.league?.flag) {
      const flag = document.createElement("img");
      flag.src = match.league.flag;
      flag.alt = "";
      flag.className = "match-country-flag";
      flag.loading = "lazy";
      league.appendChild(flag);
    }

    const leagueName = document.createElement("span");
    leagueName.textContent = match.league?.name || "Compétition";
    league.appendChild(leagueName);

    const statusInfo = this.getStatus(match.fixture?.status?.short);

    const status = document.createElement("span");
    status.className = `match-status ${statusInfo.type}`;
    status.textContent = statusInfo.label;

    const teams = document.createElement("div");
    teams.className = "dashboard-match-teams";

    const home = this.createTeam(
      match.teams?.home?.name,
      match.teams?.home?.logo,
      "home"
    );

    const away = this.createTeam(
      match.teams?.away?.name,
      match.teams?.away?.logo,
      "away"
    );

    const score = document.createElement("strong");
    score.className = "match-score";

    const goals = match.goals || {};
    const hasScore = goals.home !== null && goals.away !== null;

    score.textContent = hasScore
      ? `${goals.home} - ${goals.away}`
      : "VS";

    teams.append(home, score, away);

    const footer = document.createElement("div");
    footer.className = "match-card-footer";

    const time = document.createElement("span");
    time.textContent = statusInfo.type === "upcoming"
      ? this.formatTime(match.fixture?.date)
      : match.fixture?.status?.elapsed
        ? `${match.fixture.status.elapsed}'`
        : "";

    footer.append(status, time);

    card.dataset.status = statusInfo.type;
    card.append(league, teams, footer);

    return card;
  },

  initFilters() {
    const filters = document.querySelector(".matches-filters");

    if (!filters || this.filtersInitialized) return;

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-match-filter]");

      if (!button) return;

      this.currentFilter = button.dataset.matchFilter;

      filters.querySelectorAll("[data-match-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      this.renderFilteredMatches();
    });

    this.filtersInitialized = true;
  },

  updateCounters() {
    const total = document.getElementById("matches-total");
    const live = document.getElementById("matches-live");
    const finished = document.getElementById("matches-finished");

    const liveCount = this.currentFixtures.filter((match) =>
      this.getStatus(match.fixture?.status?.short).type === "live"
    ).length;

    const finishedCount = this.currentFixtures.filter((match) =>
      this.getStatus(match.fixture?.status?.short).type === "finished"
    ).length;

    if (total) total.textContent = this.currentFixtures.length;
    if (live) live.textContent = liveCount;
    if (finished) finished.textContent = finishedCount;
  },

  renderFilteredMatches() {
    const container = document.getElementById("matches-page-list");
    if (!container) return;

    const filtered = this.currentFixtures.filter((match) => {
      const status = this.getStatus(match.fixture?.status?.short).type;

      return this.currentFilter === "all" ||
        status === this.currentFilter;
    });

    container.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "dashboard-empty";

      const message = {
        all: "Aucune rencontre disponible aujourd'hui.",
        live: "Aucun match en direct actuellement.",
        upcoming: "Aucun match à venir.",
        finished: "Aucun match terminé."
      };

      empty.textContent = message[this.currentFilter] || "Aucun match disponible.";
      container.appendChild(empty);
      return;
    }

    filtered.forEach((match) => {
      container.appendChild(this.createCard(match));
    });
  },

  async loadToday(containerId = "dashboard-matches") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = "Chargement des rencontres...";

    try {
      const data = await window.SPORTPULSE_DATA.getFixtures(this.getToday());

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      const fixtures = data.response || [];

      if (containerId === "matches-page-list") {
        this.currentFixtures = fixtures;
        this.currentFilter = "all";

        this.initFilters();
        this.updateCounters();

        const filters = document.querySelector(".matches-filters");

        if (filters) {
          filters.querySelectorAll("[data-match-filter]").forEach((button) => {
            button.classList.toggle(
              "active",
              button.dataset.matchFilter === "all"
            );
          });
        }

        this.renderFilteredMatches();
        return;
      }

      container.replaceChildren();

      if (fixtures.length === 0) {
        container.textContent = "Aucun match programmé aujourd'hui.";
        return;
      }

      fixtures.forEach((match) => {
        container.appendChild(this.createCard(match));
      });

      console.log(`SPORTPULSE : ${fixtures.length} matchs chargés.`);

    } catch (error) {
      console.error("SPORTPULSE MATCHES:", error);
      container.textContent =
        "Impossible de charger les matchs. Réessayez plus tard.";
    }
  }
};

window.SPORTPULSE_MATCHES = Matches;
