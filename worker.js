
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

async function footballRequest(endpoint, apiKey) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`API-Football HTTP ${response.status}`);
  }

  return response.json();
}

async function ninjasRequest(endpoint, apiKey) {
  const response = await fetch(`${NINJAS_BASE}${endpoint}`, {
    headers: {
      "X-Api-Key": apiKey
    }
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Réponse API Ninjas invalide : HTTP ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(
      data.error || `API Ninjas HTTP ${response.status}`
    );
  }

  if (data && data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Ne conserver que les cinq derniers matchs terminés.
function getLastFiveFinished(data) {
  if (!Array.isArray(data.response)) {
    return data;
  }

  const finishedStatuses = ["FT", "AET", "PEN"];

  const matches = data.response
    .filter(match =>
      finishedStatuses.includes(match.fixture?.status?.short)
    )
    .sort((a, b) =>
      new Date(b.fixture.date) - new Date(a.fixture.date)
    )
    .slice(0, 5);

  return {
    ...data,
    results: matches.length,
    response: matches
  };
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "GET") {
      return json({ error: "Methode non autorisee" }, 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    /* ======================================
       API NINJAS — ROUTE DE TEST
       /test/api-ninjas?league=ligue1
    ====================================== */

    if (path === "/test/api-ninjas") {

      if (!env.API_NINJAS_KEY) {
        return json({
          error: "Clé API Ninjas non configurée sur le serveur"
        }, 503);
      }

      const league = (
        url.searchParams.get("league") || ""
      ).toLowerCase();

      const allowedLeagues = [
        "ligue1",
        "epl",
        "ucl"
      ];

      if (!allowedLeagues.includes(league)) {
        return json({
          error: "Championnat non autorisé pour ce test",
          allowed: allowedLeagues
        }, 400);
      }

      const season = "2026";
      const endpoint =
        `/soccermatches?league=${encodeURIComponent(league)}` +
        `&season=${season}&offset=0`;

      const cache = caches.default;
      const cacheKey = new Request(url.toString(), {
        method: "GET"
      });

      try {

        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse) {
          const headers = new Headers(cachedResponse.headers);
          headers.set("X-SPORTPULSE-CACHE", "HIT");

          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            headers
          });
        }

        const matches = await ninjasRequest(
          endpoint,
          env.API_NINJAS_KEY
        );

        if (!Array.isArray(matches)) {
          return json({
            error: "Format de réponse API Ninjas inattendu",
            receivedType: typeof matches
          }, 502);
        }

        const sample = matches.slice(0, 5).map(match => ({
          game_id: match.game_id,
          date: match.date,
          status: match.status,
          home_team: match.home_team?.name,
          away_team: match.away_team?.name,
          home_score: match.home_score,
          away_score: match.away_score
        }));

        const result = {
          success: true,
          provider: "API Ninjas",
          league,
          season,
          returned: matches.length,
          sample,
          message: matches.length > 0
            ? "Données récupérées avec succès"
            : "Aucun match retourné pour cette requête"
        };

        const response = new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Cache-Control": "public, max-age=3600",
              "X-SPORTPULSE-CACHE": "MISS"
            }
          }
        );

        await cache.put(cacheKey, response.clone());

        return response;

      } catch (error) {

        console.error("API NINJAS TEST:", error);

        return json({
          success: false,
          provider: "API Ninjas",
          league,
          error: error.message
        }, 502);
      }
    }

    /* ======================================
       API FOOTBALL — ROUTES EXISTANTES
    ====================================== */

    if (!env.API_FOOTBALL_KEY) {
      return json({
        error: "Cle API non configuree sur le serveur"
      }, 503);
    }

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

      endpoint =
        `/fixtures/statistics?fixture=${encodeURIComponent(fixture)}`;

      cacheDuration = 1800;

    } else if (path === "/football/team-form") {

      const team = url.searchParams.get("team");

      if (!team || !/^\d+$/.test(team)) {
        return json({ error: "Identifiant de l'equipe invalide" }, 400);
      }

      const season = new Date().getUTCFullYear();

      endpoint =
        `/fixtures?team=${encodeURIComponent(team)}&season=${season}`;

      cacheDuration = 21600;
      filterLastFive = true;

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
          error: "Identifiants des equipes invalides"
        }, 400);
      }

      endpoint =
        `/fixtures/headtohead?h2h=${encodeURIComponent(home)}-${encodeURIComponent(away)}`;

      cacheDuration = 21600;
      filterLastFive = true;

    } else {

      return json({ error: "Route inconnue" }, 404);
    }

    const cache = caches.default;

    const cacheKey = new Request(url.toString(), {
      method: "GET"
    });

    try {

      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        const headers = new Headers(cachedResponse.headers);
        headers.set("X-SPORTPULSE-CACHE", "HIT");

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          headers
        });
      }

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

      await cache.put(cacheKey, response.clone());

      return response;

    } catch (error) {

      console.error("SPORTPULSE WORKER:", error);

      return json({
        error: "Impossible de recuperer les donnees sportives",
        details: error.message
      }, 502);
    }
  }
};
