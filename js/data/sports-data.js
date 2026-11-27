
/* ==========================================
   SPORTPULSE AI — SPORTS DATA SERVICE
   API-FOOTBALL CONNECTION
========================================== */

const SportsData = {

  provider: {
    name: "API-Football",
    status: "connected"
  },

  getApiBaseUrl() {
    return window.SPORTPULSE_CONFIG?.API_BASE_URL || "";
  },

  async request(endpoint) {
    const baseUrl = this.getApiBaseUrl();

    if (!baseUrl) {
      throw new Error(
        "Connexion au serveur sportif non configurée."
      );
    }

    try {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}${endpoint}`
      );

      if (!response.ok) {
        throw new Error(
          `Erreur serveur : ${response.status}`
        );
      }

      const data = await response.json();

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(
          JSON.stringify(data.errors)
        );
      }

      return data;

    } catch (error) {
      console.error("SPORTPULSE DATA ERROR:", error);
      throw error;
    }
  },

  // MATCHS DU JOUR
  async getFixtures(date) {
    return this.request(
      `/football/fixtures?date=${encodeURIComponent(date)}`
    );
  },

  // MATCHS EN DIRECT
  async getLiveMatches() {
    return this.request("/football/live");
  },

  // COMPÉTITIONS
  async getLeagues() {
    return this.request("/football/leagues");
  },

  // STATISTIQUES D'UN MATCH
  async getMatchStatistics(fixtureId) {
    if (!fixtureId) {
      throw new Error("Identifiant du match manquant.");
    }

    return this.request(
      `/football/statistics?fixture=${encodeURIComponent(fixtureId)}`
    );
  },

  // FORME RÉCENTE D'UNE ÉQUIPE
  async getTeamForm(teamId) {
    if (!teamId) {
      throw new Error("Identifiant de l'equipe manquant.");
    }

    return this.request(
      `/football/team-form?team=${encodeURIComponent(teamId)}`
    );
  },

  // CONFRONTATIONS DIRECTES H2H
  async getHeadToHead(homeId, awayId) {
    if (
      !homeId ||
      !awayId ||
      String(homeId) === String(awayId)
    ) {
      throw new Error(
        "Identifiants des equipes invalides."
      );
    }

    return this.request(
      `/football/head-to-head?home=${encodeURIComponent(homeId)}&away=${encodeURIComponent(awayId)}`
    );
  },

  // ÉTAT DU SERVICE
  getStatus() {
    return this.provider;
  }

};

window.SPORTPULSE_DATA = SportsData;
