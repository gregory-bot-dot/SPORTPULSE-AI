
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
              <div class="page-placeholder">
                <h2>Live & Matchs</h2>
                <p>Le calendrier et les résultats sportifs seront intégrés ici.</p>
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

    document.addEventListener("sportpulse:navigate", (event) => {
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
        title.textContent =
          titles[event.detail?.page] || "SPORTPULSE AI";
      }
    });
  }
};

window.SPORTPULSE_APP = App;

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
