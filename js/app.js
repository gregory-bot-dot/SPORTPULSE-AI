
/* ==========================================
   SPORTPULSE AI — APPLICATION CORE
   MATCH DETAIL + REAL STATISTICS
========================================== */

const App = {
  selectedMatch: null,

  init() {
    console.log("SPORTPULSE AI — Initialisation");

    this.renderShell();

    if (window.SPORTPULSE_SIDEBAR) {
      window.SPORTPULSE_SIDEBAR.init();
    }

    if (window.SPORTPULSE_ROUTER) {
      window.SPORTPULSE_ROUTER.init();
    }

    this.initPageEvents();

    console.log("SPORTPULSE AI — Application prête");
  },

  renderShell() {
    const app = document.getElementById("app");

    if (!app) {
      console.error("Conteneur #app introuvable");
      return;
    }

    app.innerHTML = `
      <div class="app-layout">
        <div id="app-sidebar"></div>

        <main class="main-area">
          <header class="main-header">
            <div>
              <span class="header-eyebrow">SPORTPULSE AI</span>
              <h1 id="current-page-title">Dashboard</h1>
            </div>

            <div class="header-status">
              <span class="status-dot"></span>
              <span>Interface active</span>
            </div>
          </header>

          <div id="page-content">

            <section data-view="dashboard">
              ${
                window.SPORTPULSE_DASHBOARD
                  ? window.SPORTPULSE_DASHBOARD.render()
                  : "<p>Dashboard en cours de chargement...</p>"
              }
            </section>

            <section data-view="matches" hidden>
              <div id="matches-list-view">
                <div class="matches-page">

                  <div class="matches-page-header">
                    <div>
                      <span class="header-eyebrow">SPORTS DATA CENTER</span>
                      <h2>Live & Matchs</h2>
                      <p>Calendrier et résultats sportifs</p>
                    </div>

                    <div class="matches-date">
                      <span>DATE DU JOUR</span>
                      <strong id="matches-current-date">--</strong>
                    </div>
                  </div>

                  <div class="matches-overview">
                    <div class="matches-overview-card">
                      <span>RENCONTRES</span>
                      <strong id="matches-total">--</strong>
                    </div>

                    <div class="matches-overview-card">
                      <span>EN DIRECT</span>
                      <strong id="matches-live">--</strong>
                    </div>

                    <div class="matches-overview-card">
                      <span>TERMINÉS</span>
                      <strong id="matches-finished">--</strong>
                    </div>
                  </div>

                  <div class="matches-toolbar">
                    <div>
                      <h3>Calendrier sportif</h3>
                      <p>Rencontres récupérées depuis API-Football</p>
                    </div>

                    <button
                      class="btn btn-primary"
                      type="button"
                      onclick="window.SPORTPULSE_MATCHES.loadToday('matches-page-list')">
                      ↻ Actualiser
                    </button>
                  </div>

                  <div class="matches-league-filter">
                    <label for="matches-league-select">CHAMPIONNAT</label>
                    <select id="matches-league-select">
                      <option value="all">Tous les championnats</option>
                    </select>
                  </div>

                  <div class="matches-filters">
                    <button class="match-filter active" data-match-filter="all">Tous</button>
                    <button class="match-filter" data-match-filter="live">🔴 En direct</button>
                    <button class="match-filter" data-match-filter="upcoming">À venir</button>
                    <button class="match-filter" data-match-filter="finished">Terminés</button>
                  </div>

                  <div id="matches-page-list" class="matches-list">
                    <div class="dashboard-empty">
                      <strong>En attente des rencontres</strong>
                      <p>Appuyez sur Actualiser pour récupérer les matchs du jour.</p>
                    </div>
                  </div>

                  <p class="matches-disclaimer">
                    Les données sont fournies par une source sportive externe.
                    Leur disponibilité dépend des compétitions couvertes.
                  </p>

                </div>
              </div>

              <div id="match-detail-view" hidden>
                <button
                  id="match-detail-back"
                  class="btn btn-secondary"
                  type="button">
                  ← Retour aux matchs
                </button>

                <div id="match-detail-content"></div>
              </div>
            </section>

            <section data-view="analysis" hidden>
              <div class="page-placeholder">
                <h2>Analyses</h2>
                <p>Les analyses statistiques des rencontres seront disponibles ici.</p>
              </div>
            </section>

            <section data-view="odds" hidden>
              <div class="page-placeholder">
                <h2>Odds Center</h2>
                <p>Comparaison des cotes et des bookmakers.</p>
              </div>
            </section>

            <section data-view="scanner" hidden>
              <div class="page-placeholder">
                <h2>Scanner</h2>
                <p>Détection des écarts statistiques entre modèle et marché.</p>
              </div>
            </section>

            <section data-view="players" hidden>
              <div class="page-placeholder">
                <h2>Players</h2>
                <p>Statistiques et données individuelles des joueurs.</p>
              </div>
            </section>

            <section data-view="performance" hidden>
              <div class="page-placeholder">
                <h2>Performance Lab</h2>
                <p>Suivi des performances et évaluation des prédictions.</p>
              </div>
            </section>

            <section data-view="ai-lab" hidden>
              <div class="page-placeholder">
                <h2>AI Lab</h2>
                <p>Explications et interprétations des analyses sportives.</p>
              </div>
            </section>

          </div>
        </main>

        <div id="app-bottom-nav"></div>
      </div>
    `;
  },

  initPageEvents() {
    document.addEventListener("sportpulse:navigate", (event) => {
      const page = event.detail?.page;
      const title = document.getElementById("current-page-title");

      const titles = {
        dashboard: "Dashboard",
        matches: "Live & Matchs",
        analysis: "Analyses",
        odds: "Odds Center",
        scanner: "Scanner",
        players: "Players",
        performance: "Performance Lab",
        "ai-lab": "AI Lab"
      };

      if (title) {
        title.textContent = titles[page] || "SPORTPULSE AI";
      }

      if (page === "matches") {
        this.updateMatchesDate();
        this.closeMatchDetail();
      }
    });

    const matchesList = document.getElementById("matches-page-list");

    if (matchesList) {
      matchesList.addEventListener("click", (event) => {
        const card = event.target.closest("[data-fixture-id]");
        if (!card) return;

        const fixtureId = card.dataset.fixtureId;

        const match = window.SPORTPULSE_MATCHES?.currentFixtures.find(
          (item) => String(item.fixture?.id) === String(fixtureId)
        );

        if (match) this.openMatchDetail(match);
      });

      matchesList.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        const card = event.target.closest("[data-fixture-id]");
        if (!card) return;

        event.preventDefault();

        const fixtureId = card.dataset.fixtureId;

        const match = window.SPORTPULSE_MATCHES?.currentFixtures.find(
          (item) => String(item.fixture?.id) === String(fixtureId)
        );

        if (match) this.openMatchDetail(match);
      });
    }

    const backButton = document.getElementById("match-detail-back");

    if (backButton) {
      backButton.addEventListener("click", () => {
        this.closeMatchDetail();
      });
    }
  },

  // ==========================================
  // DIAGNOSTIC DES ERREURS
  // ==========================================

  formatDiagnosticError(error) {
    const raw = String(error?.message || error || "Erreur inconnue");
    const lower = raw.toLowerCase();

    if (
      lower.includes("ratelimit") ||
      lower.includes("rate limit") ||
      lower.includes("too many requests") ||
      lower.includes("429")
    ) {
      return "Limite de requêtes API atteinte. Attendez quelques instants avant de réessayer.";
    }

    if (
      lower.includes("timeout") ||
      lower.includes("timed out") ||
      lower.includes("abort")
    ) {
      return "La requête a expiré. Le serveur sportif met trop de temps à répondre.";
    }

    if (lower.includes("403") || lower.includes("forbidden")) {
      return "Accès API refusé (403). Vérifiez les droits ou le quota de votre abonnement.";
    }

    if (lower.includes("401") || lower.includes("unauthorized")) {
      return "Authentification API refusée (401). Vérifiez la configuration côté serveur.";
    }

    if (
      lower.includes("500") ||
      lower.includes("502") ||
      lower.includes("503") ||
      lower.includes("server")
    ) {
      return "Le serveur sportif rencontre une erreur. Réessayez plus tard.";
    }

    return raw.length > 180 ? raw.slice(0, 180) + "…" : raw;
  },

  // ==========================================
  // SÉCURITÉ HTML
  // ==========================================

  escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  },

  getStatValue(statistics, type) {
    const item = statistics.find((stat) => stat.type === type);
    return item ? item.value : null;
  },

  formatStat(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return String(value);
  },

  getNumericStat(value) {
    if (value === null || value === undefined) return null;

    const number = parseFloat(String(value).replace("%", "").replace(",", "."));

    return Number.isFinite(number) ? number : null;
  },

  // ==========================================
  // STATISTIQUES DU MATCH
  // ==========================================

  renderStatistics(data) {
    const container = document.getElementById("match-statistics-content");
    if (!container) return;

    const teams = data?.response || [];

    if (teams.length < 2) {
      container.innerHTML = `
        <div class="dashboard-empty">
          Les statistiques ne sont pas encore disponibles pour cette rencontre.
        </div>
      `;
      return;
    }

    const homeStats = teams[0].statistics || [];
    const awayStats = teams[1].statistics || [];

    const definitions = [
      { label: "Possession", type: "Ball Possession", percent: true },
      { label: "Tirs totaux", type: "Total Shots" },
      { label: "Tirs cadrés", type: "Shots on Goal" },
      { label: "Tirs non cadrés", type: "Shots off Goal" },
      { label: "Tirs bloqués", type: "Blocked Shots" },
      { label: "Corners", type: "Corner Kicks" },
      { label: "Hors-jeu", type: "Offsides" },
      { label: "Fautes", type: "Fouls" },
      { label: "Cartons jaunes", type: "Yellow Cards" },
      { label: "Cartons rouges", type: "Red Cards" },
      { label: "Arrêts gardien", type: "Goalkeeper Saves" },
      { label: "Passes réussies", type: "Passes" }
    ];

    const rows = definitions.map((definition) => {
      const homeValue = this.getStatValue(homeStats, definition.type);
      const awayValue = this.getStatValue(awayStats, definition.type);

      const homeNumber = this.getNumericStat(homeValue);
      const awayNumber = this.getNumericStat(awayValue);

      const total = homeNumber !== null && awayNumber !== null
        ? homeNumber + awayNumber
        : 0;

      const homeWidth = total > 0 ? (homeNumber / total) * 100 : 50;
      const awayWidth = total > 0 ? (awayNumber / total) * 100 : 50;

      return `
        <div class="match-stat-row">
          <div class="match-stat-values">
            <strong>${this.escapeHTML(this.formatStat(homeValue))}</strong>
            <span>${this.escapeHTML(definition.label)}</span>
            <strong>${this.escapeHTML(this.formatStat(awayValue))}</strong>
          </div>

          <div class="match-stat-bars">
            <div class="match-stat-bar home">
              <span style="width:${homeWidth}%"></span>
            </div>
            <div class="match-stat-bar away">
              <span style="width:${awayWidth}%"></span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="match-stat-team-names">
        <strong>${this.escapeHTML(teams[0].team?.name || "Domicile")}</strong>
        <strong>${this.escapeHTML(teams[1].team?.name || "Extérieur")}</strong>
      </div>
      ${rows}
      <p class="match-stat-note">
        Statistiques fournies par API-Football. Certaines données peuvent être indisponibles.
      </p>
    `;
  },

  async loadMatchStatistics(fixtureId) {
    const container = document.getElementById("match-statistics-content");
    if (!container) return;

    container.innerHTML = `
      <div class="dashboard-empty">
        Chargement des statistiques réelles...
      </div>
    `;

    try {
      const data = await window.SPORTPULSE_DATA.getMatchStatistics(fixtureId);

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      if (String(this.selectedMatch?.fixture?.id) !== String(fixtureId)) return;

      this.renderStatistics(data);

    } catch (error) {
      console.error("SPORTPULSE STATISTICS:", error);

      if (String(this.selectedMatch?.fixture?.id) !== String(fixtureId)) return;

      container.innerHTML = `
        <div class="dashboard-empty">
          Impossible de récupérer les statistiques pour le moment.
          <p>Réessayez ultérieurement.</p>
        </div>
      `;
    }
  },

  // ==========================================
  // FORME RÉCENTE — AFFICHAGE
  // ==========================================

  renderTeamForm(data, teamId, teamName) {
    const container = document.getElementById(`team-form-${teamId}`);
    if (!container) return;

    const matches = Array.isArray(data?.response)
      ? data.response
      : [];

    const finishedMatches = matches
      .filter((match) => {
        const homeGoals = match.goals?.home;
        const awayGoals = match.goals?.away;

        return (
          ["FT", "AET", "PEN"].includes(match.fixture?.status?.short)
        ) &&
        homeGoals !== null &&
        homeGoals !== undefined &&
        awayGoals !== null &&
        awayGoals !== undefined;
      })
      .sort((a, b) => {
        return new Date(b.fixture.date) - new Date(a.fixture.date);
      })
      .slice(0, 5);

    if (finishedMatches.length === 0) {
      console.warn("SPORTPULSE : aucun match terminé pour", teamName, data);

      container.innerHTML = `
        <div class="dashboard-empty">
          Aucun résultat récent disponible.
        </div>
      `;
      return;
    }

    let wins = 0;
    let draws = 0;
    let losses = 0;

    const rows = finishedMatches.map((match) => {
      const isHome = String(match.teams?.home?.id) === String(teamId);

      const scored = isHome ? match.goals.home : match.goals.away;
      const conceded = isHome ? match.goals.away : match.goals.home;

      const opponent = isHome
        ? match.teams?.away?.name
        : match.teams?.home?.name;

      let result;
      let resultLabel;

      if (scored > conceded) {
        result = "win";
        resultLabel = "V";
        wins++;
      } else if (scored === conceded) {
        result = "draw";
        resultLabel = "N";
        draws++;
      } else {
        result = "loss";
        resultLabel = "D";
        losses++;
      }

      const date = match.fixture?.date
        ? new Date(match.fixture.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit"
          })
        : "--";

      return `
        <div class="team-form-match">
          <span class="team-form-result ${result}">
            ${resultLabel}
          </span>
          <span class="team-form-opponent">
            ${this.escapeHTML(opponent || "Adversaire")}
          </span>
          <span class="team-form-score">
            ${scored} - ${conceded}
          </span>
          <span class="team-form-date">${date}</span>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <div class="team-form-summary">
        <span class="win">${wins} victoire(s)</span>
        <span class="draw">${draws} nul(s)</span>
        <span class="loss">${losses} défaite(s)</span>
      </div>
      <div class="team-form-list">
        ${rows}
      </div>
    `;
  },

  // ==========================================
  // CHAMPIONNATS API NINJAS
  // ==========================================

  getNinjasLeagueSlug(league) {
    const normalize = (value) => String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const name = normalize(league?.name);

    const aliases = {
      "ligue 1": "ligue1",
      "ligue 2": "ligue2",
      "premier league": "epl",
      "championship": "championship",
      "league one": "leagueone",
      "league two": "leaguetwo",
      "la liga": "laliga",
      "laliga": "laliga",
      "segunda division": "laliga2",
      "laliga 2": "laliga2",
      "bundesliga": "bundesliga",
      "2 bundesliga": "bundesliga2",
      "serie a": "seriea",
      "serie b": "serieb",
      "uefa champions league": "ucl",
      "champions league": "ucl",
      "uefa europa league": "uel",
      "europa league": "uel",
      "uefa conference league": "uecl",
      "conference league": "uecl",
      "eredivisie": "eredivisie",
      "primeira liga": "primeiraliga",
      "liga portugal": "primeiraliga",
      "super lig": "superlig",
      "jupiler pro league": "belgianproleague",
      "belgian pro league": "belgianproleague",
      "greek super league": "greeksuperleague",
      "austrian bundesliga": "austrianbundesliga",
      "danish superliga": "danishsuperliga",
      "allsvenskan": "allsvenskan",
      "eliteserien": "eliteserien",
      "russian premier league": "rpl",
      "brasileirao": "brasileirao",
      "copa libertadores": "libertadores",
      "copa sudamericana": "sudamericana",
      "saudi pro league": "saudiproleague",
      "chinese super league": "csl",
      "indian super league": "isl",
      "a league": "aleague",
      "j1 league": "j1league",
      "liga mx": "ligamx",
      "liga profesional": "ligaprofesional",
      "fa cup": "facup",
      "efl cup": "eflcup",
      "copa del rey": "copadelrey",
      "dfb pokal": "dfbpokal",
      "coppa italia": "coppaitalia",
      "coupe de france": "coupedefrance",
      "us open cup": "usopencup",
      "leagues cup": "leaguescup",
      "concacaf champions cup": "concacafcc",
      "fifa club world cup": "clubworldcup",
      "world cup": "worldcup",
      "uefa nations league": "nationsleague",
      "european championship": "euro",
      "copa america": "copaamerica",
      "africa cup of nations": "afcon",
      "asian cup": "asiancup",
      "gold cup": "goldcup",
      "international friendlies": "friendlies"
    };

    return aliases[name] || "";
  },

  async loadTeamForm(teamId, teamName, fixtureId, league) {
    const container = document.getElementById(`team-form-${teamId}`);

    if (!container) return;

    container.innerHTML = `
      <div class="dashboard-empty">
        Chargement des cinq derniers matchs...
      </div>
    `;

    try {
      const leagueSlug = this.getNinjasLeagueSlug(league);

      const data = await window.SPORTPULSE_DATA.getTeamForm(
        teamId,
        teamName,
        leagueSlug
      );

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      if (
        String(this.selectedMatch?.fixture?.id) !== String(fixtureId)
      ) return;

      this.renderTeamForm(data, teamId, teamName);

    } catch (error) {
      console.error("SPORTPULSE TEAM FORM:", error);

      if (
        String(this.selectedMatch?.fixture?.id) !== String(fixtureId)
      ) return;

      container.innerHTML = `
        <div class="dashboard-empty">
          Impossible de récupérer la forme récente.
          <p class="dashboard-subtitle">
            ${this.escapeHTML(this.formatDiagnosticError(error))}
          </p>
        </div>
      `;
    }
  },

  // ==========================================
  // HEAD TO HEAD — AFFICHAGE
  // ==========================================

  renderHeadToHead(data, homeId, awayId) {
    const container = document.getElementById("match-h2h-content");

    if (!container) return;

    const matches = data?.response || [];

    if (!matches.length) {
      container.innerHTML = `
        <div class="dashboard-empty">
          Aucune confrontation directe disponible.
        </div>
      `;
      return;
    }

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    const rows = matches.map(match => {
      const fixture = match.fixture || {};
      const teams = match.teams || {};
      const goals = match.goals || {};

      const matchHome = teams.home || {};
      const matchAway = teams.away || {};

      const homeGoals = goals.home;
      const awayGoals = goals.away;

      if (
        homeGoals === null ||
        awayGoals === null ||
        homeGoals === undefined ||
        awayGoals === undefined
      ) {
        return "";
      }

      const isHomeTeamHome =
        String(matchHome.id) === String(homeId);

      const selectedHomeGoals = isHomeTeamHome
        ? homeGoals
        : awayGoals;

      const selectedAwayGoals = isHomeTeamHome
        ? awayGoals
        : homeGoals;

      let result = "N";

      if (selectedHomeGoals > selectedAwayGoals) {
        homeWins++;
        result = "V";
      } else if (selectedHomeGoals < selectedAwayGoals) {
        awayWins++;
        result = "D";
      } else {
        draws++;
      }

      const opponent = isHomeTeamHome
        ? matchAway.name
        : matchHome.name;

      const date = fixture.date
        ? new Date(fixture.date).toLocaleDateString("fr-FR")
        : "Date inconnue";

      return `
        <div class="h2h-match-row">
          <div>
            <strong>${this.escapeHTML(opponent || "Adversaire")}</strong>
            <div class="dashboard-subtitle">${date}</div>
          </div>

          <strong>${selectedHomeGoals} - ${selectedAwayGoals}</strong>

          <span class="h2h-result">${result}</span>
        </div>
      `;
    }).filter(Boolean);

    if (!rows.length) {
      container.innerHTML = `
        <div class="dashboard-empty">
          Aucun résultat terminé disponible.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="h2h-summary">
        <div class="h2h-stat">
          <strong>${homeWins}</strong>
          <span>Victoires domicile</span>
        </div>

        <div class="h2h-stat">
          <strong>${draws}</strong>
          <span>Matchs nuls</span>
        </div>

        <div class="h2h-stat">
          <strong>${awayWins}</strong>
          <span>Victoires extérieur</span>
        </div>
      </div>

      <div class="h2h-match-list">
        ${rows.join("")}
      </div>
    `;
  },

  // ==========================================
  // HEAD TO HEAD — CHARGEMENT
  // ==========================================

  async loadHeadToHead(
    homeId,
    awayId,
    homeName,
    awayName,
    league
  ) {
    const container = document.getElementById("match-h2h-content");

    if (!container) return;

    const selectedFixtureId = this.selectedMatch?.fixture?.id;

    container.innerHTML = `
      <div class="dashboard-empty">
        Chargement des confrontations directes...
      </div>
    `;

    try {
      const data = await window.SPORTPULSE_DATA.getHeadToHead(
        homeId,
        awayId,
        homeName,
        awayName,
        league
      );

      if (
        String(this.selectedMatch?.fixture?.id) !==
        String(selectedFixtureId)
      ) return;

      this.renderHeadToHead(data, homeId, awayId);

    } catch (error) {
      console.error("SPORTPULSE H2H ERROR:", error);

      if (
        String(this.selectedMatch?.fixture?.id) !==
        String(selectedFixtureId)
      ) return;

      container.innerHTML = `
        <div class="dashboard-empty">
          Impossible de charger les confrontations directes.
          <p class="dashboard-subtitle">
            ${this.escapeHTML(this.formatDiagnosticError(error))}
          </p>
        </div>
      `;
    }
  },

  // ==========================================
  // FICHE DÉTAILLÉE DU MATCH
  // ==========================================

  openMatchDetail(match) {
    this.selectedMatch = match;

    const listView = document.getElementById("matches-list-view");
    const detailView = document.getElementById("match-detail-view");
    const content = document.getElementById("match-detail-content");

    if (!listView || !detailView || !content) return;

    const home = match.teams?.home || {};
    const away = match.teams?.away || {};
    const league = match.league || {};
    const fixture = match.fixture || {};

    const status = window.SPORTPULSE_MATCHES.getStatus(
      fixture.status?.short
    );

    const score = match.goals || {};

    const date = fixture.date
      ? new Date(fixture.date).toLocaleString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris"
        })
      : "Date indisponible";

    content.innerHTML = `
      <div class="match-detail-card">

        <div class="match-detail-league">
          ${league.flag ? `<img src="${this.escapeHTML(league.flag)}" alt="">` : ""}
          <div>
            <strong>${this.escapeHTML(league.name || "Compétition")}</strong>
            <span>${this.escapeHTML(league.country || "")} ${league.season ? "• Saison " + this.escapeHTML(league.season) : ""}</span>
          </div>
        </div>

        <div class="match-detail-status">
          ${this.escapeHTML(status.label)}
        </div>

        <div class="match-detail-date">
          ${this.escapeHTML(date)}
        </div>

        <div class="match-detail-scoreboard">

          <div class="match-detail-team">
            ${home.logo ? `<img src="${this.escapeHTML(home.logo)}" alt="">` : ""}
            <strong>${this.escapeHTML(home.name || "Équipe domicile")}</strong>
          </div>

          <div class="match-detail-score">
            ${score.home !== null && score.home !== undefined ? this.escapeHTML(score.home) : "-"}
            <span>:</span>
            ${score.away !== null && score.away !== undefined ? this.escapeHTML(score.away) : "-"}
          </div>

          <div class="match-detail-team">
            ${away.logo ? `<img src="${this.escapeHTML(away.logo)}" alt="">` : ""}
            <strong>${this.escapeHTML(away.name || "Équipe extérieure")}</strong>
          </div>

        </div>

        <div class="match-detail-section">
          <h3>Statistiques du match</h3>
          <p>Comparaison des performances des deux équipes</p>
          <div id="match-statistics-content"></div>
        </div>

        <div class="match-detail-section">
          <h3>Forme récente</h3>
          <p>Les cinq dernières rencontres de chaque équipe</p>

          <div class="team-form-container">
            <h4>${this.escapeHTML(home.name || "Équipe domicile")}</h4>
            <div id="team-form-${home.id}">
              <div class="dashboard-empty">
                Chargement...
              </div>
            </div>
          </div>

          <div class="team-form-container">
            <h4>${this.escapeHTML(away.name || "Équipe extérieure")}</h4>
            <div id="team-form-${away.id}">
              <div class="dashboard-empty">
                Chargement...
              </div>
            </div>
          </div>
        </div>

        <div class="match-detail-section">
          <h3>Confrontations directes</h3>
          <p>Historique des cinq dernières rencontres entre les deux équipes</p>

          <div id="match-h2h-content">
            <div class="dashboard-empty">
              Chargement des confrontations directes...
            </div>
          </div>
        </div>

        <div class="match-detail-section">
          <h3>Centre d'analyse</h3>
          <p>
            Les données statistiques serviront de base aux prochaines analyses
            et estimations de probabilités.
          </p>
        </div>

        <div class="match-detail-grid">

          <div class="match-detail-stat">
            <span>Identifiant du match</span>
            <strong>${this.escapeHTML(fixture.id || "N/A")}</strong>
          </div>

          <div class="match-detail-stat">
            <span>Championnat</span>
            <strong>${this.escapeHTML(league.name || "N/A")}</strong>
          </div>

          <div class="match-detail-stat">
            <span>État</span>
            <strong>${this.escapeHTML(status.label)}</strong>
          </div>

          <div class="match-detail-stat">
            <span>Round</span>
            <strong>${this.escapeHTML(league.round || "N/A")}</strong>
          </div>

        </div>
      </div>
    `;

    listView.hidden = true;
    detailView.hidden = false;

    const title = document.getElementById("current-page-title");
    if (title) title.textContent = "Fiche du match";

    window.scrollTo({ top: 0, behavior: "smooth" });

    // ======================================
    // STATISTIQUES DU MATCH
    // ======================================

    const fixtureStatus = fixture.status?.short;

    const unavailableStatuses = [
      "NS",
      "TBD",
      "PST",
      "CANC",
      "ABD",
      "AWD",
      "WO"
    ];

    const statisticsContainer = document.getElementById(
      "match-statistics-content"
    );

    if (String(fixture.id).startsWith("ninjas:")) {
      if (statisticsContainer) {
        statisticsContainer.innerHTML = `
          <div class="dashboard-empty">
            Statistiques détaillées indisponibles avec le fournisseur de secours.
          </div>
        `;
      }
    } else if (unavailableStatuses.includes(fixtureStatus)) {
      if (statisticsContainer) {
        statisticsContainer.innerHTML = `
          <div class="dashboard-empty">
            Les statistiques seront disponibles à partir du coup d'envoi.
          </div>
        `;
      }
    } else {
      this.loadMatchStatistics(fixture.id);
    }

    // ======================================
    // FORME RÉCENTE
    // ======================================

    if (home.id) {
      this.loadTeamForm(
        home.id,
        home.name,
        fixture.id,
        league
      );
    }

    if (away.id) {
      this.loadTeamForm(
        away.id,
        away.name,
        fixture.id,
        league
      );
    }

    // ======================================
    // CONFRONTATIONS DIRECTES
    // ======================================

    const leagueSlug = this.getNinjasLeagueSlug(league);

    if (home.id && away.id) {
      this.loadHeadToHead(
        home.id,
        away.id,
        home.name,
        away.name,
        leagueSlug
      );
    }
  },

  closeMatchDetail() {
    const listView = document.getElementById("matches-list-view");
    const detailView = document.getElementById("match-detail-view");

    if (listView) listView.hidden = false;
    if (detailView) detailView.hidden = true;

    this.selectedMatch = null;

    const title = document.getElementById("current-page-title");
    if (title) title.textContent = "Live & Matchs";
  },

  updateMatchesDate() {
    const dateElement = document.getElementById("matches-current-date");

    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }
};

window.SPORTPULSE_APP = App;

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
