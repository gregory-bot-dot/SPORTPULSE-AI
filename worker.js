
/* ==========================================
   SPORTPULSE AI — SECURE API WORKER
   CACHE + MATCH STATISTICS
========================================== */

const API_BASE = "https://v3.football.api-sports.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store"
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

    if (path === "/football/fixtures") {
      const date = url.searchParams.get("date");

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return json({ error: "Date invalide" }, 400);
      }

      endpoint = `/fixtures?date=${encodeURIComponent(date)}`;
      cacheDuration = 300;

    } else if (path === "/football/live") {
      endpoint = "/fixtures?live=all";
      cacheDuration = 60;

    } else if (path === "/football/leagues") {
      endpoint = "/leagues?current=true";
      cacheDuration = 3600;

    } else if (path === "/football/statistics") {
      const fixture = url.searchParams.get("fixture");

      if (!fixture || !/^\d+$/.test(fixture)) {
        return json({ error: "Identifiant du match invalide" }, 400);
      }

      endpoint = `/fixtures/statistics?fixture=${encodeURIComponent(fixture)}`;
      cacheDuration = 300;

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

      if (data.errors && Object.keys(data.errors).length > 0) {
        return json(data);
      }

      const response = new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": `public, max-age=${cacheDuration}`,
          "X-SPORTPULSE-CACHE": "MISS"
        }
      });

      await cache.put(cacheKey, response.clone());

      return response;

    } catch (error) {
      console.error("SPORTPULSE WORKER:", error);

      return json({
        error: "Impossible de recuperer les donnees sportives"
      }, 502);
    }
  }
};
