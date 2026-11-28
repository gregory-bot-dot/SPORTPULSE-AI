
/* ==========================================
   CONFRONTATIONS DIRECTES — SECOURS API NINJAS
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

    const fetchTeamMatches = async (teamName) => {
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
