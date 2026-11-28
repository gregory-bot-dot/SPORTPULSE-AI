
/* ==========================================
   SPORTPULSE AI — ANALYSIS ENGINE
   Statistiques réelles sur les 5 derniers matchs
========================================== */

const AnalysisEngine = {

  getFinishedMatches(data) {
    const matches = Array.isArray(data?.response)
      ? data.response
      : [];

    return matches.filter(match => {
      const status = match.fixture?.status?.short;

      const home = Number(match.goals?.home);
      const away = Number(match.goals?.away);

      return (
        ["FT", "AET", "PEN"].includes(status) &&
        Number.isFinite(home) &&
        Number.isFinite(away)
      );
    });
  },

  summarize(data, teamId) {
    const matches = this.getFinishedMatches(data);

    const stats = {
      matches: matches.length,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      cleanSheets: 0,
      failedToScore: 0,
      over25: 0,
      bothScored: 0,
      home: {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0
      },
      away: {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0
      }
    };

    for (const match of matches) {
      const homeId = match.teams?.home?.id;
      const awayId = match.teams?.away?.id;

      const isHome = String(homeId) === String(teamId);
      const isAway = String(awayId) === String(teamId);

      if (!isHome && !isAway) continue;

      const scored = Number(
        isHome ? match.goals.home : match.goals.away
      );

      const conceded = Number(
        isHome ? match.goals.away : match.goals.home
      );

      const venue = isHome ? stats.home : stats.away;

      stats.goalsFor += scored;
      stats.goalsAgainst += conceded;

      venue.matches++;
      venue.goalsFor += scored;
      venue.goalsAgainst += conceded;

      if (scored > conceded) {
        stats.wins++;
        venue.wins++;
      } else if (scored === conceded) {
        stats.draws++;
        venue.draws++;
      } else {
        stats.losses++;
        venue.losses++;
      }

      if (conceded === 0) stats.cleanSheets++;
      if (scored === 0) stats.failedToScore++;

      if (scored + conceded > 2.5) {
        stats.over25++;
      }

      if (scored > 0 && conceded > 0) {
        stats.bothScored++;
      }
    }

    const count = stats.matches;

    stats.points = stats.wins * 3 + stats.draws;

    stats.averagePoints = this.average(
      stats.points,
      count
    );

    stats.averageGoalsFor = this.average(
      stats.goalsFor,
      count
    );

    stats.averageGoalsAgainst = this.average(
      stats.goalsAgainst,
      count
    );

    stats.averageTotalGoals = this.average(
      stats.goalsFor + stats.goalsAgainst,
      count
    );

    stats.cleanSheetRate = this.percentage(
      stats.cleanSheets,
      count
    );

    stats.failedToScoreRate = this.percentage(
      stats.failedToScore,
      count
    );

    stats.over25Rate = this.percentage(
      stats.over25,
      count
    );

    stats.bothScoredRate = this.percentage(
      stats.bothScored,
      count
    );

    stats.home.averageGoalsFor = this.average(
      stats.home.goalsFor,
      stats.home.matches
    );

    stats.home.averageGoalsAgainst = this.average(
      stats.home.goalsAgainst,
      stats.home.matches
    );

    stats.away.averageGoalsFor = this.average(
      stats.away.goalsFor,
      stats.away.matches
    );

    stats.away.averageGoalsAgainst = this.average(
      stats.away.goalsAgainst,
      stats.away.matches
    );

    stats.sampleLabel = `${count} match(s) analysé(s)`;

    return stats;
  },

  average(total, count) {
    if (!count) return null;
    return Number((total / count).toFixed(2));
  },

  percentage(value, total) {
    if (!total) return null;
    return Math.round((value / total) * 100);
  },

  format(value, suffix = "") {
    if (value === null || value === undefined) {
      return "—";
    }

    return `${value}${suffix}`;
  }

};

window.SPORTPULSE_ANALYSIS = AnalysisEngine;

console.log("SPORTPULSE AI — Moteur statistique chargé");
