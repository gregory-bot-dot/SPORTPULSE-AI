
/* ==========================================
   SPORTPULSE AI — SPORTS DATA MANAGER
========================================== */

const SportsData = {

  provider: {
    name: "API-Football",
    status: "not_connected"
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
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error("SPORTPULSE DATA ERROR:", error);
      throw error;
    }
  },

  async getFixtures(date) {
    return this.request(
      `/football/fixtures?date=${encodeURIComponent(date)}`
    );
  },

  async getLiveMatches() {
    return this.request("/football/live");
  },

  async getLeagues() {
    return this.request("/football/leagues");
  },

  getStatus() {
    return {
      provider: this.provider.name,
      status: this.provider.status,
      serverConfigured: Boolean(this.getApiBaseUrl())
    };
  }
};

window.SPORTPULSE_DATA = SportsData;
