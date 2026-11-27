
/* ==========================================
   SPORTPULSE AI — DASHBOARD PAGE
========================================== */

const Dashboard = {

  render() {
    const today = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    return `
      <div class="dashboard">

        <section class="dashboard-welcome">
          <div>
            <span class="badge badge-accent">SPORTS INTELLIGENCE</span>
            <h1>Dashboard</h1>
            <p>Bienvenue dans votre centre d'analyse sportive.</p>
          </div>
          <div class="dashboard-date">${today}</div>
        </section>

        <section class="dashboard-stats">
          <article class="dashboard-stat">
            <span class="dashboard-stat-label">MATCHS DU JOUR</span>
            <strong class="dashboard-stat-value">—</strong>
            <span class="dashboard-stat-note">En attente des données</span>
          </article>

          <article class="dashboard-stat">
            <span class="dashboard-stat-label">ANALYSES RÉALISÉES</span>
            <strong class="dashboard-stat-value">0</strong>
            <span class="dashboard-stat-note">Aucune analyse enregistrée</span>
          </article>

          <article class="dashboard-stat">
            <span class="dashboard-stat-label">SIGNAUX DÉTECTÉS</span>
            <strong class="dashboard-stat-value">0</strong>
            <span class="dashboard-stat-note">Scanner non connecté</span>
          </article>

          <article class="dashboard-stat">
            <span class="dashboard-stat-label">PRÉCISION DU MODÈLE</span>
            <strong class="dashboard-stat-value">—</strong>
            <span class="dashboard-stat-note">Historique insuffisant</span>
          </article>
        </section>

        <section class="dashboard-grid">

          <div class="dashboard-panel">
            <div class="dashboard-panel-header">
              <div>
                <h2 class="dashboard-panel-title">Matchs à suivre</h2>
                <p class="dashboard-panel-subtitle">
                  Calendrier sportif du jour
                </p>
              </div>
              <span class="badge badge-neutral">LIVE & MATCHS</span>
            </div>

            <div class="dashboard-matches-actions">
              <button
                class="btn btn-primary"
                type="button"
                onclick="window.SPORTPULSE_MATCHES.loadToday()"
              >
                ⚽ Charger les matchs du jour
              </button>
            </div>

            <div id="dashboard-matches" class="dashboard-empty">
              <strong>En attente de récupération</strong>
              <p>
                Appuyez sur le bouton pour récupérer
                les rencontres depuis notre source sportive.
              </p>
            </div>
          </div>

          <div class="dashboard-panel">
            <div class="dashboard-panel-header">
              <div>
                <h2 class="dashboard-panel-title">Moteur SPORTPULSE</h2>
                <p class="dashboard-panel-subtitle">
                  État des différents modules
                </p>
              </div>
            </div>

            <div class="dashboard-activity">

              <div class="dashboard-engine">
                <div class="dashboard-engine-icon">◈</div>
                <div class="dashboard-engine-info">
                  <strong>Interface utilisateur</strong>
                  <small>Initialisée</small>
                </div>
                <span class="badge badge-success">OK</span>
              </div>

              <div class="dashboard-engine">
                <div class="dashboard-engine-icon">⚽</div>
                <div class="dashboard-engine-info">
                  <strong>Football Engine</strong>
                  <small>Connexion API préparée</small>
                </div>
                <span class="badge badge-neutral">TEST</span>
              </div>

              <div class="dashboard-engine">
                <div class="dashboard-engine-icon">▤</div>
                <div class="dashboard-engine-info">
                  <strong>Odds Provider</strong>
                  <small>Source non connectée</small>
                </div>
                <span class="badge badge-neutral">OFF</span>
              </div>

              <div class="dashboard-engine">
                <div class="dashboard-engine-icon">✳</div>
                <div class="dashboard-engine-info">
                  <strong>AI Analysis</strong>
                  <small>En préparation</small>
                </div>
                <span class="badge badge-neutral">OFF</span>
              </div>

            </div>
          </div>

        </section>

        <section class="dashboard-panel">
          <div class="dashboard-panel-header">
            <div>
              <h2 class="dashboard-panel-title">Activité récente</h2>
              <p class="dashboard-panel-subtitle">État du projet</p>
            </div>
          </div>

          <div class="dashboard-activity">
            <div class="dashboard-activity-item">
              <span class="dashboard-activity-dot"></span>
              <span>Interface SPORTPULSE AI initialisée.</span>
            </div>

            <div class="dashboard-activity-item">
              <span class="dashboard-activity-dot"></span>
              <span>Navigation et modules principaux créés.</span>
            </div>

            <div class="dashboard-activity-item">
              <span class="dashboard-activity-dot"></span>
              <span>Connexion aux données sportives préparée.</span>
            </div>
          </div>
        </section>

        <p class="dashboard-disclaimer">
          SPORTPULSE AI est un outil d'analyse statistique.
          Les prédictions ne garantissent aucun résultat.
          Les données sportives et les cotes sont affichées
          uniquement après connexion de sources vérifiées.
        </p>

      </div>
    `;
  }
};

window.SPORTPULSE_DASHBOARD = Dashboard;
