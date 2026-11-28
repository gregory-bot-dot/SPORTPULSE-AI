
/* ==========================================
   SPORTPULSE AI — SECURE API WORKER
   API-FOOTBALL + API NINJAS
   FREE PLAN OPTIMIZED
   CACHE + RATE LIMIT PROTECTION
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

const NINJAS_FIXTURE_LEAGUES = [
  { slug: "ligue1", name: "Ligue 1", country: "France" },
  { slug: "ligue2", name: "Ligue 2", country: "France" },
  { slug: "epl", name: "Premier League", country: "England" },
  { slug: "laliga", name: "La Liga", country: "Spain" },
  { slug: "bundesliga", name: "Bundesliga", country: "Germany" },
  { slug: "seriea", name: "Serie A", country: "Italy" },
  { slug: "ucl", name: "Champions League", country: "World" },
  { slug: "uel", name: "Europa League", country: "World" }
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
  return new Request(url.toString(), { method: "GET" });
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
  try {
    await cache.put(key, response.clone());
  } catch (error) {
    console.error("CACHE SAVE ERROR:", error.message);
  }
  return response;
}

/* ==========================================
   QUOTA API-FOOTBALL
========================================== */

async function rateLimitResponse(cache, cacheKey, details = {}) {
  const response = new Response(JSON.stringify({
    success: false,
    provider: "API-Football",
    rateLimit: true,
    message: "Limite API atteinte. Réessayez dans une minute.",
    errors: details
  }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Cache-Control": "public, max-age=60",
      "X-SPORTPULSE-CACHE": "RATE-LIMIT"
    }
  });

  return saveCache(cache, cacheKey, response);
}

function isRateLimitError(errors) {
  const message = JSON.stringify(errors || {}).toLowerCase();

  return (
    message.includes("too many requests") ||
    message.includes("rate limit") ||
    message.includes("requests per minute") ||
    message.includes("quota exceeded")
  );
}

/* ==========================================
   API FOOTBALL
========================================== */

async function footballRequest(endpoint, apiKey) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "x-apisports-key": apiKey }
  });

  if (response.status === 429) {
    const error = new Error("API-Football HTTP 429");
    error.rateLimit = true;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`API-Football HTTP ${response.status}`);
  }

  return response.json();
}

/* ==========================================
   API NINJAS
========================================== */

async function ninjasRequest(endpoint, apiKey) {
  const response = await fetch(`${NINJAS_BASE}${endpoint}`, {
    headers: { "X-Api-Key": apiKey }
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Réponse API Ninjas invalide : HTTP ${response.status}`);
  }

  if (!response.ok || data?.error) {
    throw new Error(data?.error || `API Ninjas HTTP ${response.status}`);
  }

  return data;
}

/* ==========================================
   CINQ DERNIERS MATCHS
========================================== */

function getLastFiveFinished(data) {
  if (!Array.isArray(data.response)) return data;

  const matches = data.response
    .filter(match =>
      ["FT", "AET", "PEN"].includes(match.fixture?.status?.short)
    )
    .sort((a, b) =>
      new Date(b.fixture.date) - new Date(a.fixture.date)
    )
    .slice(0, 5);

  return { ...data, results: matches.length, response: matches };
}

/* ==========================================
   NORMALISATION MATCHS API NINJAS
========================================== */

function normalizeNinjasMatches(matches, teamId, teamName) {
  if (!Array.isArray(matches)) {
    throw new Error("Format des matchs API Ninjas invalide");
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
    const isHome = sameTeam(home.name, teamName);
    const date = match.start_time || `${match.date || ""}T12:00:00Z`;

    return {
      fixture: {
        id: match.game_id,
        date,
        status: { short: "FT", long: "Match terminé" }
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
      league: { name: match.league || "Compétition" },
      source: "API Ninjas"
    };
  });
}

/* ==========================================
   NORMALISATION MATCHS DU JOUR API NINJAS
========================================== */

function normalizeNinjasFixture(match, competition) {
  const home = match.home_team || {};
  const away = match.away_team || {};
  const startTime = match.start_time || match.date || null;
  const rawStatus = String(match.status || "").toLowerCase();

  let statusShort = "NS";
  let statusLong = "À venir";

  if (["final", "finished", "completed"].includes(rawStatus)) {
    statusShort = "FT";
    statusLong = "Match terminé";
  } else if (
    rawStatus.includes("live") ||
    rawStatus.includes("progress") ||
    rawStatus.includes("half")
  ) {
    statusShort = "NINJAS_LIVE";
    statusLong = "En cours — score en direct indisponible";
  } else if (rawStatus.includes("postpon")) {
    statusShort = "PST";
    statusLong = "Reporté";
  } else if (rawStatus.includes("cancel")) {
    statusShort = "CANC";
    statusLong = "Annulé";
  }

  const hasScores =
    match.home_score !== null &&
    match.home_score !== undefined &&
    match.away_score !== null &&
    match.away_score !== undefined;

  const homeScore = hasScores ? Number(match.home_score) : null;
  const awayScore = hasScores ? Number(match.away_score) : null;

  return {
    fixture: {
      id: `ninjas:${match.game_id || `${competition.slug}:${startTime}:${home.name}:${away.name}`}`,
      date: startTime,
      timestamp: startTime
        ? Math.floor(new Date(startTime).getTime() / 1000)
        : null,
      status: {
        short: statusShort,
        long: statusLong,
        elapsed: null
      }
    },
    teams: {
      home: {
        id: home.team_id || null,
        name: home.name || "Équipe domicile",
        logo: null,
        winner: hasScores ? homeScore > awayScore : null
      },
      away: {
        id: away.team_id || null,
        name: away.name || "Équipe extérieure",
        logo: null,
        winner: hasScores ? awayScore > homeScore : null
      }
    },
    goals: { home: homeScore, away: awayScore },
    league: {
      id: `ninjas-${competition.slug}`,
      name: competition.name,
      country: competition.country,
      logo: null,
      flag: null,
      season: new Date().getUTCFullYear()
    },
    source: "API Ninjas",
    sourceGameId: match.game_id || null
  };
}

/* ==========================================
   SECOURS MATCHS DU JOUR API NINJAS
========================================== */

async function getNinjasFixtures(date, env, cache, cacheKey, reason = "API-Football indisponible") {
  if (!env.API_NINJAS_KEY) {
    return json({
      success: false,
      provider: "API Ninjas",
      message: "Clé API Ninjas non configurée",
      fallback: false
    }, 503);
  }

  try {
    const requests = NINJAS_FIXTURE_LEAGUES.map(async competition => {
      const endpoint =
        `/soccermatches?league=${encodeURIComponent(competition.slug)}` +
        `&date=${encodeURIComponent(date)}`;

      const matches = await ninjasRequest(endpoint, env.API_NINJAS_KEY);

      if (!Array.isArray(matches)) {
        throw new Error(`Format invalide pour ${competition.name}`);
      }

      return { competition, matches };
    });

    const settled = await Promise.allSettled(requests);
    const allMatches = [];
    const failedLeagues = [];
    const successfulLeagues = [];

    for (let index = 0; index < settled.length; index++) {
      const result = settled[index];
      const competition = NINJAS_FIXTURE_LEAGUES[index];

      if (result.status === "fulfilled") {
        successfulLeagues.push(competition.slug);

        for (const match of result.value.matches) {
          allMatches.push(normalizeNinjasFixture(match, competition));
        }
      } else {
        failedLeagues.push({
          league: competition.slug,
          error: result.reason?.message || "Erreur inconnue"
        });
      }
    }

    if (successfulLeagues.length === 0) {
      return json({
        success: false,
        provider: "API Ninjas",
        message: "Impossible de récupérer les matchs via API Ninjas",
        reason,
        failedLeagues
      }, 502);
    }

    const uniqueMatches = [];
    const seen = new Set();

    for (const match of allMatches) {
      const key = match.sourceGameId ||
        `${match.league.id}:${match.fixture.date}:${normalizeName(match.teams.home.name)}:${normalizeName(match.teams.away.name)}`;

      if (seen.has(key)) continue;
      seen.add(key);
      uniqueMatches.push(match);
    }

    uniqueMatches.sort((a, b) =>
      new Date(a.fixture.date || 0) - new Date(b.fixture.date || 0)
    );

    const result = {
      success: true,
      provider: "API Ninjas",
      fallback: true,
      fallbackReason: reason,
      date,
      results: uniqueMatches.length,
      response: uniqueMatches,
      competitionsRequested: NINJAS_FIXTURE_LEAGUES.length,
      competitionsSuccessful: successfulLeagues,
      partial: failedLeagues.length > 0,
      failedLeagues
    };

    const response = new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=600",
        "X-SPORTPULSE-PROVIDER": "API-Ninjas",
        "X-SPORTPULSE-CACHE": "FALLBACK"
      }
    });

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    console.error("NINJAS FIXTURES ERROR:", error);

    return json({
      success: false,
      provider: "API Ninjas",
      message: "Erreur pendant la récupération des matchs",
      details: error.message
    }, 502);
  }
}

/* ==========================================
   TEST API NINJAS — CHAMPIONNAT
========================================== */

async function testNinjasLeague(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({ error: "Clé API Ninjas non configurée" }, 503);
  }

  const league = (url.searchParams.get("league") || "").toLowerCase();

  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({ error: "Championnat non autorisé", allowed: ALLOWED_LEAGUES }, 400);
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

    const matches = await ninjasRequest(endpoint, env.API_NINJAS_KEY);
    if (!Array.isArray(matches)) throw new Error("Format de réponse inattendu");

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

    const response = new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Cache-Control": "public, max-age=3600" }
    });

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    return json({
      success: false,
      provider: "API Ninjas",
      error: error.message
    }, 502);
  }
}

/* ==========================================
   TEST API NINJAS — ÉQUIPE
========================================== */

async function testNinjasTeam(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({ error: "Clé API Ninjas non configurée" }, 503);
  }

  const team = url.searchParams.get("team");
  const league = (url.searchParams.get("league") || "").toLowerCase();

  if (!team) return json({ error: "Nom de l'équipe manquant" }, 400);
  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({ error: "Championnat manquant ou invalide", allowed: ALLOWED_LEAGUES }, 400);
  }

  const season = new Date().getUTCFullYear();
  const endpoint =
    `/soccermatches?league=${encodeURIComponent(league)}` +
    `&team=${encodeURIComponent(team)}&season=${season}&offset=0`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const matches = await ninjasRequest(endpoint, env.API_NINJAS_KEY);
    if (!Array.isArray(matches)) throw new Error("Format des matchs invalide");

    const finished = matches
      .filter(match =>
        match.status === "final" &&
        match.home_score !== null &&
        match.home_score !== undefined &&
        match.away_score !== null &&
        match.away_score !== undefined
      )
      .sort((a, b) =>
        new Date(b.start_time || b.date) - new Date(a.start_time || a.date)
      )
      .slice(0, 5);

    const result = {
      success: true,
      provider: "API Ninjas",
      requestedTeam: team,
      league,
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

    const response = new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Cache-Control": "public, max-age=3600" }
    });

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    return json({
      success: false,
      provider: "API Ninjas",
      requestedTeam: team,
      league,
      error: error.message
    }, 502);
  }
}

/* ==========================================
   API NINJAS — CLASSEMENTS
========================================== */

async function getStandings(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({ error: "Clé API Ninjas non configurée" }, 503);
  }

  const league = (url.searchParams.get("league") || "").toLowerCase();
  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({ error: "Championnat non autorisé", allowed: ALLOWED_LEAGUES }, 400);
  }

  const season = url.searchParams.get("season") ||
    String(new Date().getUTCFullYear());

  if (!/^\d{4}$/.test(season)) return json({ error: "Saison invalide" }, 400);

  const endpoint =
    `/soccerstandings?league=${encodeURIComponent(league)}` +
    `&season=${encodeURIComponent(season)}`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const standings = await ninjasRequest(endpoint, env.API_NINJAS_KEY);
    if (!Array.isArray(standings)) throw new Error("Format de classement invalide");

    const ordered = standings.sort((a, b) =>
      (a.league_rank ?? 999) - (b.league_rank ?? 999)
    );

    const response = new Response(JSON.stringify({
      success: true,
      provider: "API Ninjas",
      league,
      season,
      results: ordered.length,
      response: ordered
    }), {
      status: 200,
      headers: { ...corsHeaders, "Cache-Control": "public, max-age=3600" }
    });

    return saveCache(cache, cacheKey, response);

  } catch (error) {
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
========================================== */

async function getSquad(url, env) {
  if (!env.API_NINJAS_KEY) {
    return json({ error: "Clé API Ninjas non configurée" }, 503);
  }

  const league = (url.searchParams.get("league") || "").toLowerCase();
  const team = url.searchParams.get("team");

  if (!ALLOWED_LEAGUES.includes(league)) {
    return json({ error: "Championnat manquant ou invalide" }, 400);
  }
  if (!team) return json({ error: "Nom de l'équipe manquant" }, 400);

  const endpoint =
    `/soccerplayers?league=${encodeURIComponent(league)}` +
    `&team=${encodeURIComponent(team)}&offset=0`;

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const players = await ninjasRequest(endpoint, env.API_NINJAS_KEY);
    if (!Array.isArray(players)) throw new Error("Format d'effectif invalide");

    const response = new Response(JSON.stringify({
      success: true,
      provider: "API Ninjas",
      league,
      team,
      results: players.length,
      response: players
    }), {
      status: 200,
      headers: { ...corsHeaders, "Cache-Control": "public, max-age=3600" }
    });

    return saveCache(cache, cacheKey, response);

  } catch (error) {
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
   CONFRONTATIONS DIRECTES — SECOURS NINJAS
========================================== */

async function getNinjasHeadToHead(url, env) {
  const homeName = url.searchParams.get("homeName");
  const awayName = url.searchParams.get("awayName");
  const league = (url.searchParams.get("league") || "").toLowerCase();

  if (!env.API_NINJAS_KEY || !homeName || !awayName ||
      !ALLOWED_LEAGUES.includes(league)) {
    return json({
      success: false,
      provider: "API Ninjas",
      response: [],
      message: "Informations insuffisantes pour rechercher les confrontations."
    });
  }

  const cache = caches.default;
  const cacheKey = getCacheKey(url);

  try {
    const cached = await getCached(cache, cacheKey);
    if (cached) return cached;

    const season = new Date().getUTCFullYear();

    const fetchTeamMatches = async teamName => {
      const endpoint =
        `/soccermatches?league=${encodeURIComponent(league)}` +
        `&team=${encodeURIComponent(teamName)}` +
        `&season=${season}&offset=0`;

      return ninjasRequest(endpoint, env.API_NINJAS_KEY);
    };

    const [homeMatches, awayMatches] = await Promise.all([
      fetchTeamMatches(homeName),
      fetchTeamMatches(awayName)
    ]);

    if (!Array.isArray(homeMatches) || !Array.isArray(awayMatches)) {
      throw new Error("Format des confrontations API Ninjas invalide.");
    }

    const awayIds = new Set(
      awayMatches.map(match => String(match.game_id))
    );

    const common = homeMatches
      .filter(match =>
        match.game_id && awayIds.has(String(match.game_id))
      )
      .filter(match =>
        match.home_score !== null &&
        match.home_score !== undefined &&
        match.away_score !== null &&
        match.away_score !== undefined &&
        ["final", "finished", "completed"].includes(
          String(match.status || "").toLowerCase()
        )
      )
      .sort((a, b) =>
        new Date(b.start_time || b.date) -
        new Date(a.start_time || a.date)
      )
      .slice(0, 5);

    const responseData = {
      success: true,
      provider: "API Ninjas",
      results: common.length,
      response: common.map(match => normalizeNinjasFixture(match, {
        slug: league,
        name: match.league || league,
        country: ""
      })),
      message: common.length
        ? "Confrontations récupérées via API Ninjas."
        : "Aucune confrontation récente trouvée dans cette compétition."
    };

    const response = new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=21600",
        "X-SPORTPULSE-PROVIDER": "API-Ninjas"
      }
    });

    return saveCache(cache, cacheKey, response);

  } catch (error) {
    console.error("NINJAS HEAD TO HEAD:", error);

    return json({
      success: false,
      provider: "API Ninjas",
      response: [],
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
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return json({ error: "Méthode non autorisée" }, 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    /* ROUTES API NINJAS */

    if (path === "/test/api-ninjas") return testNinjasLeague(url, env);
    if (path === "/test/api-ninjas-team") return testNinjasTeam(url, env);
    if (path === "/football/standings") return getStandings(url, env);
    if (path === "/football/squad") return getSquad(url, env);

    /* CONFIGURATION API FOOTBALL */

    let endpoint;
    let cacheDuration;
    let filterLastFive = false;

    if (path === "/football/fixtures") {
      const date = url.searchParams.get("date");

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return json({ error: "Date invalide" }, 400);
      }

      endpoint = `/fixtures?date=${encodeURIComponent(date)}`;
      cacheDuration = 600;

    } else if (path === "/football/live") {
      endpoint = "/fixtures?live=all";
      cacheDuration = 60;

    } else if (path === "/football/leagues") {
      endpoint = "/leagues?current=true";
      cacheDuration = 86400;

    } else if (path === "/football/statistics") {
      const fixture = url.searchParams.get("fixture");

      if (!fixture || !/^\d+$/.test(fixture)) {
        return json({ error: "Identifiant du match invalide" }, 400);
      }

      endpoint = `/fixtures/statistics?fixture=${encodeURIComponent(fixture)}`;
      cacheDuration = 1800;

    } else if (path === "/football/team-form") {
      const team = url.searchParams.get("team");
      const teamName = url.searchParams.get("name");
      const teamLeague = (url.searchParams.get("league") || "").toLowerCase();

      if (!team || !/^\d+$/.test(team)) {
        return json({ error: "Identifiant de l'équipe invalide" }, 400);
      }

      const cache = caches.default;
      const cacheKey = getCacheKey(url);

      try {
        const cached = await getCached(cache, cacheKey);
        if (cached) return cached;

        if (
          teamName &&
          teamLeague &&
          ALLOWED_LEAGUES.includes(teamLeague) &&
          env.API_NINJAS_KEY
        ) {
          try {
            const season = new Date().getUTCFullYear();
            const ninjasEndpoint =
              `/soccermatches?league=${encodeURIComponent(teamLeague)}` +
              `&team=${encodeURIComponent(teamName)}` +
              `&season=${season}&offset=0`;

            const matches = await ninjasRequest(ninjasEndpoint, env.API_NINJAS_KEY);
            const normalized = normalizeNinjasMatches(matches, team, teamName);

            if (normalized.length > 0) {
              const response = new Response(JSON.stringify({
                get: "team-form",
                results: normalized.length,
                response: normalized,
                provider: "API Ninjas"
              }), {
                status: 200,
                headers: {
                  ...corsHeaders,
                  "Cache-Control": "public, max-age=21600",
                  "X-SPORTPULSE-PROVIDER": "API-Ninjas"
                }
              });

              return saveCache(cache, cacheKey, response);
            }
          } catch (ninjasError) {
            console.error("NINJAS TEAM FORM:", ninjasError.message);
          }
        }

        if (!env.API_FOOTBALL_KEY) {
          return json({
            error: "Clé API-Football non configurée",
            provider: "API-Football"
          }, 503);
        }

        const season = new Date().getUTCFullYear();
        const fallbackEndpoint =
          `/fixtures?team=${encodeURIComponent(team)}&season=${season}`;

        const fallbackData = await footballRequest(
          fallbackEndpoint,
          env.API_FOOTBALL_KEY
        );

        if (fallbackData.errors && Object.keys(fallbackData.errors).length > 0) {
          if (isRateLimitError(fallbackData.errors)) {
            return rateLimitResponse(cache, cacheKey, fallbackData.errors);
          }

          return json({
            error: "Impossible de récupérer la forme récente",
            provider: "API-Football",
            errors: fallbackData.errors
          }, 502);
        }

        const finalData = getLastFiveFinished(fallbackData);

        const response = new Response(JSON.stringify({
          ...finalData,
          provider: "API-Football"
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Cache-Control": "public, max-age=21600",
            "X-SPORTPULSE-PROVIDER": "API-Football"
          }
        });

        return saveCache(cache, cacheKey, response);

      } catch (error) {
        console.error("TEAM FORM ERROR:", error);

        if (error.rateLimit) {
          return rateLimitResponse(cache, cacheKey, {
            rateLimit: "Too many requests"
          });
        }

        return json({
          error: "Impossible de récupérer la forme récente",
          details: error.message
        }, 502);
      }

    } else if (path === "/football/head-to-head") {
      const home = url.searchParams.get("home");
      const away = url.searchParams.get("away");

      if (!home || !away || !/^\d+$/.test(home) ||
          !/^\d+$/.test(away) || home === away) {
        return json({ error: "Identifiants des équipes invalides" }, 400);
      }

      endpoint =
        `/fixtures/headtohead?h2h=${encodeURIComponent(home)}-${encodeURIComponent(away)}`;

      cacheDuration = 21600;
      filterLastFive = true;

    } else {
      return json({ error: "Route inconnue" }, 404);
    }

    /* CACHE */

    const cache = caches.default;
    const cacheKey = getCacheKey(url);

    try {
      const cached = await getCached(cache, cacheKey);
      if (cached) return cached;

      /* API FOOTBALL PRIORITAIRE */

      if (!env.API_FOOTBALL_KEY) {
        if (path === "/football/fixtures") {
          return getNinjasFixtures(
            url.searchParams.get("date"),
            env,
            cache,
            cacheKey,
            "Clé API-Football non configurée"
          );
        }

        if (path === "/football/head-to-head") {
          return getNinjasHeadToHead(url, env);
        }

        return json({ error: "Clé API-Football non configurée" }, 503);
      }

      let data;

      try {
        data = await footballRequest(endpoint, env.API_FOOTBALL_KEY);
      } catch (error) {
        if (path === "/football/fixtures" && error.rateLimit) {
          return getNinjasFixtures(
            url.searchParams.get("date"),
            env,
            cache,
            cacheKey,
            "Limite API-Football atteinte"
          );
        }

        if (path === "/football/head-to-head" && error.rateLimit) {
          return getNinjasHeadToHead(url, env);
        }

        throw error;
      }

      if (data.errors && Object.keys(data.errors).length > 0) {
        if (path === "/football/fixtures" && isRateLimitError(data.errors)) {
          return getNinjasFixtures(
            url.searchParams.get("date"),
            env,
            cache,
            cacheKey,
            "Limite API-Football atteinte"
          );
        }

        if (path === "/football/head-to-head" && isRateLimitError(data.errors)) {
          return getNinjasHeadToHead(url, env);
        }

        if (isRateLimitError(data.errors)) {
          return rateLimitResponse(cache, cacheKey, data.errors);
        }

        return json({
          success: false,
          provider: "API-Football",
          errors: data.errors
        }, 502);
      }

      const finalData = filterLastFive ? getLastFiveFinished(data) : data;

      const response = new Response(JSON.stringify({
        ...finalData,
        provider: "API-Football"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": `public, max-age=${cacheDuration}`,
          "X-SPORTPULSE-CACHE": "MISS",
          "X-SPORTPULSE-PROVIDER": "API-Football"
        }
      });

      return saveCache(cache, cacheKey, response);

    } catch (error) {
      console.error("SPORTPULSE WORKER:", error);

      if (path === "/football/fixtures" && error.rateLimit) {
        return getNinjasFixtures(
          url.searchParams.get("date"),
          env,
          cache,
          cacheKey,
          "Limite API-Football atteinte"
        );
      }

      if (path === "/football/head-to-head" && error.rateLimit) {
        return getNinjasHeadToHead(url, env);
      }

      if (error.rateLimit) {
        return rateLimitResponse(cache, cacheKey, {
          rateLimit: "Too many requests"
        });
      }

      return json({
        error: "Impossible de récupérer les données sportives",
        details: error.message
      }, 502);
    }
  }
};
