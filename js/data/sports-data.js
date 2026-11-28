
/* ==========================================
   SPORTPULSE AI — SPORTS DATA SERVICE
   API-FOOTBALL + API NINJAS
========================================== */

const SportsData = {

  provider: {
    name: "API-Football + API Ninjas",
    status: "connected"
  },

  getApiBaseUrl() {
    return window.SPORTPULSE_CONFIG?.API_BASE_URL || "";
  },

  async request(endpoint) {
    const baseUrl = this.getApiBaseUrl();

    if (!baseUrl) {
      throw new Error("Connexion au serveur sportif non configurée.");
    }

    try {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}${endpoint}`
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();

      if (data.errors && Object.keys(data.errors).length > 0) {
        throw new Error(JSON.stringify(data.errors));
      }

      if (data.success === false) {
        throw new Error(
          data.message || data.error || "Le fournisseur n'a pas retourné de données."
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

    if (String(fixtureId).startsWith("ninjas:")) {
      throw new Error(
        "Les statistiques détaillées ne sont pas disponibles pour ce match via le fournisseur de secours."
      );
    }

    return this.request(
      `/football/statistics?fixture=${encodeURIComponent(fixtureId)}`
    );
  },

  // FORME RÉCENTE — API NINJAS EN PRIORITÉ
  async getTeamForm(teamId, teamName, league) {
    if (!teamId) {
      throw new Error("Identifiant de l'équipe manquant.");
    }

    const params = new URLSearchParams({
      team: String(teamId)
    });

    if (teamName) params.set("name", teamName);
    if (league) params.set("league", league);

    return this.request(
      `/football/team-form?${params.toString()}`
    );
  },

  // CONFRONTATIONS DIRECTES
  async getHeadToHead(
    homeId,
    awayId,
    homeName,
    awayName,
    league
  ) {
    if (
      !homeId ||
      !awayId ||
      String(homeId) === String(awayId)
    ) {
      throw new Error("Identifiants des équipes invalides.");
    }

    const params = new URLSearchParams({
      home: String(homeId),
      away: String(awayId)
    });

    if (homeName) params.set("homeName", homeName);
    if (awayName) params.set("awayName", awayName);
    if (league) params.set("league", league);

    return this.request(
      `/football/head-to-head?${params.toString()}`
    );
  },

  // ÉTAT DU SERVICE
  getStatus() {
    return this.provider;
  }

};

window.SPORTPULSE_DATA = SportsData;
