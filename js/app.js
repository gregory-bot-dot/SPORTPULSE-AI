
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

      if (this.selectedMatch?.fixture?.id !== fixtureId) return;

      this.renderStatistics(data);

    } catch (error) {
      console.error("SPORTPULSE STATISTICS:", error);

      if (this.selectedMatch?.fixture?.id !== fixtureId) return;

      container.innerHTML = `
        <div class="dashboard-empty">
          Impossible de récupérer les statistiques pour le moment.
          <p>Réessayez ultérieurement.</p>
        </div>
      `;
    }
  },

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

    this.loadMatchStatistics(fixture.id);
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
