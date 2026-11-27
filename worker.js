
/* ==========================================
   SPORTPULSE AI — SECURE API WORKER
   FREE PLAN OPTIMIZED
   CACHE + STATISTICS + TEAM FORM + H2H
========================================== */

const API_BASE = "https://v3.football.api-sports.io";

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

    if (!env.API_FOOTBALL_KEY) {
      return json({
        error: "Cle API non configuree sur le serveur"
      }, 503);
    }

    const url = new URL(request.url);
    const path = url.pathname;

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

      if (!team || !/^\d+$/.test(team)) {
        return json({ error: "Identifiant de l'equipe invalide" }, 400);
      }

      const season = new Date().getUTCFullYear();

      // Pas de paramètre last : incompatible avec le forfait Free.
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

      // Pas de paramètre last : filtrage effectué côté Worker.
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

      // Vérification du cache avant tout appel API.
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        const headers = new Headers(cachedResponse.headers);
        headers.set("X-SPORTPULSE-CACHE", "HIT");

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          headers
        });
      }

      // Appel API-Football.
      const data = await footballRequest(
        endpoint,
        env.API_FOOTBALL_KEY
      );

      // Gestion des erreurs du fournisseur.
      if (
        data.errors &&
        Object.keys(data.errors).length > 0
      ) {
        return json({
          errors: data.errors
        }, 200);
      }

      // Filtrage des cinq derniers matchs terminés.
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

      // Enregistrement des données dans le cache Cloudflare.
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
