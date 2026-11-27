
/* ==========================================
   SPORTPULSE AI — APPLICATION CORE
========================================== */

const App = {

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
  <button class="match-filter active" data-match-filter="all">
    Tous
  </button>
  <button class="match-filter" data-match-filter="live">
    🔴 En direct
  </button>
  <button class="match-filter" data-match-filter="upcoming">
    À venir
  </button>
  <button class="match-filter" data-match-filter="finished">
    Terminés
  </button>
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
      }
    });
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
