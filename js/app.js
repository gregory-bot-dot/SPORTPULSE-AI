
/* ==========================================
   SPORTPULSE AI — APPLICATION CORE
========================================== */

const App = {
  init() {
    console.log("SPORTPULSE AI — Initializing...");

    this.renderShell();

    if (window.SPORTPULSE_SIDEBAR) {
      window.SPORTPULSE_SIDEBAR.init();
    }

    if (window.SPORTPULSE_ROUTER) {
      window.SPORTPULSE_ROUTER.init();
    }

    console.log("SPORTPULSE AI — Ready");
  },

  renderShell() {
    const app = document.getElementById("app");

    if (!app) {
      console.error("SPORTPULSE: #app container missing.");
      return;
    }

    app.innerHTML = `
      <div class="app-layout">

        <div id="app-sidebar"></div>

        <main class="main-area">

          <header class="main-header">
            <div>
              <div class="header-label">SPORTS INTELLIGENCE</div>
              <strong id="current-page-title">Dashboard</strong>
            </div>

            <div class="header-actions">
              <span class="engine-status">
                <span class="status-dot"></span>
                Engine Ready
              </span>
            </div>
          </header>

          <div class="main-content" id="page-content">
            <section data-view="dashboard">
              <div class="page-section">
                <div class="section-heading">
                  <div>
                    <h1 class="section-title">Dashboard</h1>
                    <p class="section-description">
                      Welcome to SPORTPULSE AI.
                    </p>
                  </div>
                  <span class="badge badge-accent">VERSION 0.1</span>
                </div>

                <div class="card">
                  <h2>Sports Intelligence Platform</h2>
                  <p class="text-muted">
                    Your sports analytics workspace is being prepared.
                  </p>
                </div>
              </div>
            </section>

            <section data-view="matches" hidden>
              <h1 class="section-title">Live & Matchs</h1>
              <p class="section-description">Upcoming fixtures and results.</p>
            </section>

            <section data-view="analysis" hidden>
              <h1 class="section-title">Analyses</h1>
              <p class="section-description">Statistical match analysis.</p>
            </section>

            <section data-view="odds" hidden>
              <h1 class="section-title">Odds Center</h1>
              <p class="section-description">Odds and market intelligence.</p>
            </section>

            <section data-view="scanner" hidden>
              <h1 class="section-title">Scanner</h1>
              <p class="section-description">Statistical opportunity scanner.</p>
            </section>

            <section data-view="players" hidden>
              <h1 class="section-title">Players</h1>
              <p class="section-description">Player statistics and form.</p>
            </section>

            <section data-view="performance" hidden>
              <h1 class="section-title">Performance Lab</h1>
              <p class="section-description">Prediction performance tracking.</p>
            </section>

            <section data-view="ai-lab" hidden>
              <h1 class="section-title">AI Lab</h1>
              <p class="section-description">AI-powered sports insights.</p>
            </section>
          </div>

        </main>

        <div id="app-bottom-nav"></div>

      </div>
    `;

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

    window.addEventListener("sportpulse:navigate", event => {
      const title = document.getElementById("current-page-title");
      if (title) {
        title.textContent = titles[event.detail.page] || "SPORTPULSE AI";
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

window.SPORTPULSE_APP = App;
