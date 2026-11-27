
/* ==========================================
   SPORTPULSE AI — SECURE API WORKER
   API-FOOTBALL + API NINJAS
   FREE PLAN OPTIMIZED
========================================== */

const API_BASE = "https://v3.football.api-sports.io";
const NINJAS_BASE = "https://api.api-ninjas.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

const ALLOWED_LEAGUES = [
  "ligue1", "ligue2",
  "epl", "championship", "leagueone", "leaguetwo",
  "laliga", "laliga2",
  "bundesliga", "bundesliga2",
  "seriea", "serieb",
  "ucl", "uel", "uecl",
  "eredivisie", "primeiraliga",
  "superlig", "belgianproleague",
  "greeksuperleague", "austrianbundesliga",
  "danishsuperliga", "allsvenskan", "eliteserien",
  "rpl", "brasileirao", "libertadores", "sudamericana",
  "uslc", "saudiproleague", "csl", "isl",
  "aleague", "acl", "cafcl", "ligamx",
  "ligaprofesional", "j1league",
  "facup", "eflcup", "copadelrey", "dfbpokal",
  "coppaitalia", "coupedefrance", "usopencup",
  "leaguescup", "concacafcc", "clubworldcup",
  "wsl", "ligaf", "premiereligue", "aleaguewomen",
  "nsl", "uslsuperleague", "uwcl",
  "worldcup", "wcqeurope", "wcqsouthamerica",
  "wcqnorthamerica", "wcqasia", "wcqafrica",
  "nationsleague", "euro", "euroqualifying",
  "copaamerica", "afcon", "asiancup", "goldcup",
  "concacafnationsleague", "friendlies",
  "womensworldcup", "womenseuro"
];

/* ==========================================
   UTILITAIRES
========================================== */

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sameTeam(a, b) {
  const first = normalizeName(a);
  const second = normalizeName(b);

  if (!first || !second) return false;

  return (
    first === second ||
    first.includes(second) ||
    second.includes(first)
  );
}

function getCacheKey(url) {
  return new Request(url.toString(), {
    method: "GET"
  });
}

async function getCached(cache, key) {
  const cached = await cache.match(key);

  if (!cached) return null;

  const headers = new Headers(cached.headers);
  headers.set("X-SPORTPULSE-CACHE", "HIT");

  return new Response(cached.body, {
    status: cached.status,
    headers
  });
}

async function saveCache(cache, key, response) {
  await cache.put(key, response.clone());
  return response;
}

/* ==========================================
   API FOOTBALL
========================================== */

async function footballRequest(endpoint, apiKey) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": apiKey
    }
  });

  if (!response.ok) {
    throw new Error(
      `API-Football HTTP ${response.status}`
    );
  }

  return response.json();
}

/* ==========================================
   API NINJAS
========================================== */

async function ninjasRequest(endpoint, apiKey) {
  const response = await fetch(
    `${NINJAS_BASE}${endpoint}`,
    {
      headers: {
        "X-Api-Key": apiKey
      }
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Réponse API Ninjas invalide : HTTP ${response.status}`
    );
  }

  if (!response.ok || data?.error) {
    throw new Error(
      data?.error || `API Ninjas HTTP ${response.status}`
    );
  }

  return data;
}

/* ==========================================
   CINQ DERNIERS MATCHS API FOOTBALL
========================================== */

function getLastFiveFinished(data) {
  if (!Array.isArray(data.response)) {
    return data;
  }

  const finishedStatuses = ["FT", "AET", "PEN"];

  const matches = data.response
    .filter(match =>
      finishedStatuses.includes(
        match.fixture?.status?.short
      )
    )
    .sort((a, b) =>
      new Date(b.fixture.date) -
      new Date(a.fixture.date)
    )
    .slice(0, 5);

  return {
    ...data,
    results: matches.length,
    response: matches
  };
}

/* ==========================================
   NORMALISATION DES MATCHS API NINJAS
========================================== */

function normalizeNinjasMatches(
  matches,
  teamId,
  teamName
) {
  if (!Array.isArray(matches)) {
    throw new Error(
      "Format des matchs API Ninjas invalide"
    );
  }

  const finished = matches
    .filter(match =>
      match.status === "final" &&
      match.home_score !== null &&
      match.home_score !== undefined &&
      match.away_score !== null &&
      match.away_score !== undefined
    )
    .sort((a, b) =>
      new Date(b.start_time || b.date) -
      new Date(a.start_time || a.date)
    )
    .slice(0, 5);

  return finished.map(match => {
    const home = match.home_team || {};
    const away = match.away_team || {};

    const isHome = sameTeam(
      home.name,
      teamName
    );

    const date =
      match.start_time ||
      `${match.date || ""}T12:00:00Z`;

    return {
      fixture: {
        id: match.game_id,
        date,
        status: {
          short: "FT",
          long: "Match terminé"
        }
      },

      teams: {
        home: {
          id: isHome ? teamId : home.team_id,
          name: home.name || "Équipe domicile"
        },

        away: {
          id: isHome ? away.team_id : teamId,
          name: away.name || "Équipe extérieure"
        }
      },

      goals: {
        home: Number(match.home_score),
        away: Number(match.away_score)
      },

      league: {
        name: match.league || "Compétition"
      },

      source: "API Ninjas"
    };
  });
}

/* ==========================================
   TEST API NINJAS — CHAMPIONNAT
   /test/api-ninjas?league=ligue1
========================================== */

async function testNinjasLeague(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({
      error: "Clé API Ninjas non configurée"
    }, 503);
  }

  const league = (
    url.searchParams.get("league") || ""
  ).toLowerCase();

  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({
      error: "Championnat non autorisé",
      allowed: ALLOWED_LEAGUES
    }, 400);
  }

  const season = new Date().getUTCFullYear();

  const endpoint =
    `/soccermatches?league=${encodeURIComponent(league)}` +
    `&season=${season}&offset=0`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const matches = await ninjasRequest(
      endpoint,
      env.API_NINJAS_KEY
    );

    if (!Array.isArray(matches)) {
      throw new Error(
        "Format de réponse inattendu"
      );
    }

    const result = {
      success: true,
      provider: "API Ninjas",
      league,
      season,
      returned: matches.length,

      sample: matches.slice(0, 5).map(match => ({
        game_id: match.game_id,
        date: match.date,
        status: match.status,
        home_team: match.home_team?.name,
        away_team: match.away_team?.name,
        home_score: match.home_score,
        away_score: match.away_score
      }))
    };

    const response = new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600"
        }
      }
    );

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    console.error("NINJAS LEAGUE TEST:", error);

    return json({
      success: false,
      provider: "API Ninjas",
      error: error.message
    }, 502);
  }
}

/* ==========================================
   TEST API NINJAS — ÉQUIPE
   /test/api-ninjas-team?team=Brest
========================================== */

async function testNinjasTeam(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({
      error: "Clé API Ninjas non configurée"
    }, 503);
  }

  const team = url.searchParams.get("team");

  if (!team) {
    return json({
      error: "Nom de l'équipe manquant"
    }, 400);
  }

  const season = new Date().getUTCFullYear();

  const endpoint =
    `/soccermatches?team=${encodeURIComponent(team)}` +
    `&season=${season}&offset=0`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const matches = await ninjasRequest(
      endpoint,
      env.API_NINJAS_KEY
    );

    if (!Array.isArray(matches)) {
      throw new Error(
        "Format des matchs invalide"
      );
    }

    const finished = matches
      .filter(match =>
        match.status === "final" &&
        match.home_score !== null &&
        match.away_score !== null
      )
      .sort((a, b) =>
        new Date(b.start_time || b.date) -
        new Date(a.start_time || a.date)
      )
      .slice(0, 5);

    const result = {
      success: true,
      provider: "API Ninjas",
      requestedTeam: team,
      season,
      returned: matches.length,
      finishedMatches: finished.length,

      sample: finished.map(match => ({
        date: match.start_time || match.date,
        competition: match.league,
        home: match.home_team?.name,
        away: match.away_team?.name,
        homeScore: match.home_score,
        awayScore: match.away_score
      }))
    };

    const response = new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600"
        }
      }
    );

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    console.error("NINJAS TEAM TEST:", error);

    return json({
      success: false,
      provider: "API Ninjas",
      requestedTeam: team,
      error: error.message
    }, 502);
  }
}

/* ==========================================
   API NINJAS — CLASSEMENTS
   /football/standings?league=ligue1
========================================== */

async function getStandings(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({
      error: "Clé API Ninjas non configurée"
    }, 503);
  }

  const league = (
    url.searchParams.get("league") || ""
  ).toLowerCase();

  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({
      error: "Championnat non autorisé",
      allowed: ALLOWED_LEAGUES
    }, 400);
  }

  const season = url.searchParams.get("season") ||
    String(new Date().getUTCFullYear());

  if (!/^\d{4}$/.test(season)) {
    return json({
      error: "Saison invalide"
    }, 400);
  }

  const endpoint =
    `/soccerstandings?league=${encodeURIComponent(league)}` +
    `&season=${encodeURIComponent(season)}`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const standings = await ninjasRequest(
      endpoint,
      env.API_NINJAS_KEY
    );

    if (!Array.isArray(standings)) {
      throw new Error(
        "Format de classement invalide"
      );
    }

    const ordered = standings.sort((a, b) =>
      (a.league_rank ?? 999) -
      (b.league_rank ?? 999)
    );

    const result = {
      success: true,
      provider: "API Ninjas",
      league,
      season,
      results: ordered.length,
      response: ordered
    };

    const response = new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600"
        }
      }
    );

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    console.error("STANDINGS ERROR:", error);

    return json({
      success: false,
      provider: "API Ninjas",
      league,
      error: error.message
    }, 502);
  }
}

/* ==========================================
   API NINJAS — EFFECTIFS
   /football/squad?league=ligue1&team=Paris Saint-Germain
========================================== */

async function getSquad(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({
      error: "Clé API Ninjas non configurée"
    }, 503);
  }

  const league = (
    url.searchParams.get("league") || ""
  ).toLowerCase();

  const team = url.searchParams.get("team");

  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({
      error: "Championnat manquant ou invalide"
    }, 400);
  }

  if (!team) {
    return json({
      error: "Nom de l'équipe manquant"
    }, 400);
  }

  const endpoint =
    `/soccerplayers?league=${encodeURIComponent(league)}` +
    `&team=${encodeURIComponent(team)}&offset=0`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const players = await ninjasRequest(
      endpoint,
      env.API_NINJAS_KEY
    );

    if (!Array.isArray(players)) {
      throw new Error(
        "Format d'effectif invalide"
      );
    }

    const result = {
      success: true,
      provider: "API Ninjas",
      league,
      team,
      results: players.length,
      response: players
    };

    const response = new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600"
        }
      }
    );

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    console.error("SQUAD ERROR:", error);

    return json({
      success: false,
      provider: "API Ninjas",
      league,
      team,
      error: error.message
    }, 502);
  }
}

/* ==========================================
   WORKER PRINCIPAL
========================================== */

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "GET") {
      return json({
        error: "Méthode non autorisée"
      }, 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    /* ======================================
       ROUTES API NINJAS
    ====================================== */

    if (path === "/test/api-ninjas") {
      return testNinjasLeague(url, env);
    }

    if (path === "/test/api-ninjas-team") {
      return testNinjasTeam(url, env);
    }

    if (path === "/football/standings") {
      return getStandings(url, env);
    }

    if (path === "/football/squad") {
      return getSquad(url, env);
    }

    /* ======================================
       ROUTES API FOOTBALL
    ====================================== */

    if (!env.API_FOOTBALL_KEY) {
      return json({
        error: "Clé API-Football non configurée"
      }, 503);
    }

    let endpoint;
    let cacheDuration;
    let filterLastFive = false;

    /* MATCHS DU JOUR */

    if (path === "/football/fixtures") {

      const date = url.searchParams.get("date");

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return json({
          error: "Date invalide"
        }, 400);
      }

      endpoint =
        `/fixtures?date=${encodeURIComponent(date)}`;

      cacheDuration = 600;

    /* MATCHS EN DIRECT */

    } else if (path === "/football/live") {

      endpoint = "/fixtures?live=all";
      cacheDuration = 60;

    /* COMPÉTITIONS */

    } else if (path === "/football/leagues") {

      endpoint = "/leagues?current=true";
      cacheDuration = 86400;

    /* STATISTIQUES D'UN MATCH */

    } else if (path === "/football/statistics") {

      const fixture = url.searchParams.get("fixture");

      if (!fixture || !/^\d+$/.test(fixture)) {
        return json({
          error: "Identifiant du match invalide"
        }, 400);
      }

      endpoint =
        `/fixtures/statistics?fixture=${encodeURIComponent(fixture)}`;

      cacheDuration = 1800;

    /* FORME RÉCENTE */

    } else if (path === "/football/team-form") {

      const team = url.searchParams.get("team");
      const teamName = url.searchParams.get("name");

      if (!team || !/^\d+$/.test(team)) {
        return json({
          error: "Identifiant de l'équipe invalide"
        }, 400);
      }

      const cache = caches.default;
      const cacheKey = getCacheKey(url);

      try {
        const cached = await getCached(cache, cacheKey);
        if (cached) return cached;

        /* API NINJAS EN PRIORITÉ */

        if (teamName && env.API_NINJAS_KEY) {
          try {
            const season = new Date().getUTCFullYear();

            const ninjasEndpoint =
              `/soccermatches?team=${encodeURIComponent(teamName)}` +
              `&season=${season}&offset=0`;

            const matches = await ninjasRequest(
              ninjasEndpoint,
              env.API_NINJAS_KEY
            );

            const normalized = normalizeNinjasMatches(
              matches,
              team,
              teamName
            );

            if (normalized.length > 0) {
              const result = {
                get: "team-form",
                results: normalized.length,
                response: normalized,
                provider: "API Ninjas"
              };

              const response = new Response(
                JSON.stringify(result),
                {
                  status: 200,
                  headers: {
                    ...corsHeaders,
                    "Cache-Control": "public, max-age=21600",
                    "X-SPORTPULSE-PROVIDER": "API-Ninjas"
                  }
                }
              );

              return saveCache(cache, cacheKey, response);
            }

          } catch (ninjasError) {
            console.error(
              "NINJAS TEAM FORM:",
              ninjasError.message
            );
          }
        }

        /* REPLI API FOOTBALL */

        const season = new Date().getUTCFullYear();

        const fallbackEndpoint =
          `/fixtures?team=${encodeURIComponent(team)}` +
          `&season=${season}`;

        const fallbackData = await footballRequest(
          fallbackEndpoint,
          env.API_FOOTBALL_KEY
        );

        if (
          fallbackData.errors &&
          Object.keys(fallbackData.errors).length > 0
        ) {
          return json({
            error: "Impossible de récupérer la forme récente",
            provider: "API-Football",
            details: fallbackData.errors
          }, 502);
        }

        const finalData = getLastFiveFinished(fallbackData);

        const response = new Response(
          JSON.stringify({
            ...finalData,
            provider: "API-Football"
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Cache-Control": "public, max-age=21600",
              "X-SPORTPULSE-PROVIDER": "API-Football"
            }
          }
        );

        return saveCache(cache, cacheKey, response);

      } catch (error) {
        console.error("TEAM FORM ERROR:", error);

        return json({
          error: "Impossible de récupérer la forme récente",
          details: error.message
        }, 502);
      }

    /* CONFRONTATIONS DIRECTES */

    } else if (path === "/football/head-to-head") {

      const home = url.searchParams.get("home");
      const away = url.searchParams.get("away");

      if (
        !home ||
        !away ||
        !/^\d+$/.test(home) ||
        !/^\d+$/.test(away) ||
        home === away
      ) {
        return json({
          error: "Identifiants des équipes invalides"
        }, 400);
      }

      endpoint =
        `/fixtures/headtohead?h2h=${encodeURIComponent(home)}-${encodeURIComponent(away)}`;

      cacheDuration = 21600;
      filterLastFive = true;

    } else {

      return json({
        error: "Route inconnue"
      }, 404);
    }

    /* ======================================
       CACHE API FOOTBALL
    ====================================== */

    const cache = caches.default;
    const cacheKey = getCacheKey(url);

    try {
      const cached = await getCached(cache, cacheKey);
      if (cached) return cached;

      const data = await footballRequest(
        endpoint,
        env.API_FOOTBALL_KEY
      );

      if (
        data.errors &&
        Object.keys(data.errors).length > 0
      ) {
        return json({
          errors: data.errors
        }, 200);
      }

      const finalData = filterLastFive
        ? getLastFiveFinished(data)
        : data;

      const response = new Response(
        JSON.stringify(finalData),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Cache-Control": `public, max-age=${cacheDuration}`,
            "X-SPORTPULSE-CACHE": "MISS"
          }
        }
      );

      return saveCache(cache, cacheKey, response);

    } catch (error) {
      console.error("SPORTPULSE WORKER:", error);

      return json({
        error: "Impossible de récupérer les données sportives",
        details: error.message
      }, 502);
    }
  }
};
