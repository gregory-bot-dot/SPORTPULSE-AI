
/* ==========================================
   SPORTPULSE AI — SECURE API WORKER
   Cloudflare Workers
========================================== */

const API_BASE = "https://v3.football.api-sports.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
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

  return await response.json();
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
      return json({ error: "Méthode non autorisée" }, 405);
    }

    if (!env.API_FOOTBALL_KEY) {
      return json({
        error: "Clé API non configurée sur le serveur"
      }, 503);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let endpoint;

      if (path === "/football/fixtures") {
        const date = url.searchParams.get("date");

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return json({
            error: "Date invalide. Format attendu : YYYY-MM-DD"
          }, 400);
        }

        endpoint = `/fixtures?date=${encodeURIComponent(date)}`;

      } else if (path === "/football/live") {
        endpoint = "/fixtures?live=all";

      } else if (path === "/football/leagues") {
        endpoint = "/leagues?current=true";

      } else {
        return json({
          error: "Route inconnue"
        }, 404);
      }

      const data = await footballRequest(
        endpoint,
        env.API_FOOTBALL_KEY
      );

      return json(data);

    } catch (error) {
      console.error("SPORTPULSE WORKER:", error);

      return json({
        error: "Impossible de récupérer les données sportives"
      }, 502);
    }
  }
};
