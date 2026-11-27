
/* ==========================================
   SPORTPULSE AI — MATCHES MODULE
========================================== */

const Matches = {

  getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  async loadToday(containerId = "dashboard-matches") {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.textContent = "Chargement des rencontres...";

    try {
      const data = await window.SPORTPULSE_DATA.getFixtures(
        this.getToday()
      );

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      const fixtures = data.response || [];

      container.replaceChildren();

      if (fixtures.length === 0) {
        container.textContent =
          "Aucun match programmé aujourd'hui.";
        return;
      }

      fixtures.forEach((match) => {
        const card = document.createElement("article");
        card.className = "dashboard-match-card";

        const league = document.createElement("small");
        league.textContent = match.league?.name || "Compétition";

        const teams = document.createElement("div");
        teams.className = "dashboard-match-teams";

        const home = document.createElement("strong");
        home.textContent = match.teams?.home?.name || "Équipe domicile";

        const away = document.createElement("strong");
        away.textContent = match.teams?.away?.name || "Équipe extérieur";

        const score = document.createElement("span");
        const goals = match.goals || {};

        score.textContent =
          goals.home !== null && goals.away !== null
            ? `${goals.home} - ${goals.away}`
            : "VS";

        const status = document.createElement("small");
        status.textContent =
          match.fixture?.status?.long || "À venir";

        teams.append(home, score, away);
        card.append(league, teams, status);
        container.appendChild(card);
      });

    } catch (error) {
      console.error("SPORTPULSE MATCHES:", error);

      container.textContent =
        "Impossible de charger les matchs. Réessayez plus tard.";
    }
  }
};

window.SPORTPULSE_MATCHES = Matches;
