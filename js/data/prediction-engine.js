
/* ==========================================
   SPORTPULSE AI — PREDICTION ENGINE
   Modèle Poisson + données statistiques réelles
   Version 1.0
========================================== */

const PredictionEngine = {

  // Réglages du modèle
  MAX_GOALS: 7,
  MIN_MATCHES: 3,

  // Moyenne sécurisée
  average(values) {
    const valid = values.filter(
      value => Number.isFinite(value) && value >= 0
    );

    if (!valid.length) return null;

    return valid.reduce((sum, value) => sum + value, 0)
      / valid.length;
  },

  // Sélection des statistiques domicile / extérieur
  getTeamRates(stats, venue) {
    if (!stats || !stats.matches) return null;

    const overallScored = stats.averageGoalsFor;
    const overallConceded = stats.averageGoalsAgainst;

    const venueStats = stats[venue];

    // On utilise les statistiques du lieu uniquement
    // si au moins deux matchs sont disponibles.
    if (
      venueStats &&
      venueStats.matches >= 2 &&
      Number.isFinite(venueStats.averageGoalsFor) &&
      Number.isFinite(venueStats.averageGoalsAgainst)
    ) {
      return {
        scored: venueStats.averageGoalsFor,
        conceded: venueStats.averageGoalsAgainst,
        sample: venueStats.matches,
        source: venue
      };
    }

    if (
      Number.isFinite(overallScored) &&
      Number.isFinite(overallConceded)
    ) {
      return {
        scored: overallScored,
        conceded: overallConceded,
        sample: stats.matches,
        source: "overall"
      };
    }

    return null;
  },

  // Loi de Poisson
  poisson(lambda, goals) {
    if (!Number.isFinite(lambda) || lambda < 0) return 0;

    let factorial = 1;

    for (let i = 2; i <= goals; i++) {
      factorial *= i;
    }

    return (
      Math.exp(-lambda) *
      Math.pow(lambda, goals) /
      factorial
    );
  },

  // Distribution des scores
  buildScoreMatrix(homeLambda, awayLambda) {
    const matrix = [];
    let total = 0;

    for (let homeGoals = 0; homeGoals <= this.MAX_GOALS; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= this.MAX_GOALS; awayGoals++) {

        const probability =
          this.poisson(homeLambda, homeGoals) *
          this.poisson(awayLambda, awayGoals);

        matrix.push({
          homeGoals,
          awayGoals,
          probability
        });

        total += probability;
      }
    }

    // Normalisation pour compenser les scores au-delà de la grille.
    if (total > 0) {
      matrix.forEach(score => {
        score.probability /= total;
      });
    }

    return matrix;
  },

  // Niveau de fiabilité basé sur les échantillons disponibles
  getConfidence(homeStats, awayStats, homeRates, awayRates) {
    const minimum = Math.min(
      homeStats.matches,
      awayStats.matches
    );

    const venueMinimum = Math.min(
      homeRates.sample,
      awayRates.sample
    );

    if (minimum < this.MIN_MATCHES) {
      return {
        level: "insuffisant",
        score: 0,
        message: "Pas assez de matchs pour produire une estimation fiable."
      };
    }

    let score = 30;

    score += Math.min(minimum, 10) * 5;

    if (homeRates.source !== "overall") score += 5;
    if (awayRates.source !== "overall") score += 5;

    if (venueMinimum >= 3) score += 5;

    score = Math.min(score, 75);

    let level = "limité";

    if (score >= 65) level = "modéré";

    return {
      level,
      score,
      message: "Fiabilité indicative : elle dépend de la quantité et de la qualité des données disponibles."
    };
  },

  // Fonction principale
  predict(homeStats, awayStats) {

    if (!homeStats || !awayStats) {
      return {
        available: false,
        reason: "Statistiques des deux équipes manquantes."
      };
    }

    if (
      homeStats.matches < this.MIN_MATCHES ||
      awayStats.matches < this.MIN_MATCHES
    ) {
      return {
        available: false,
        reason: "Au moins trois matchs terminés par équipe sont nécessaires.",
        homeMatches: homeStats.matches || 0,
        awayMatches: awayStats.matches || 0
      };
    }

    const homeRates = this.getTeamRates(homeStats, "home");
    const awayRates = this.getTeamRates(awayStats, "away");

    if (!homeRates || !awayRates) {
      return {
        available: false,
        reason: "Données offensives ou défensives insuffisantes."
      };
    }

    // Estimation des buts attendus.
    // Attaque domicile confrontée à la défense extérieure.
    const expectedHomeGoals = Math.max(
      0.15,
      Math.min(
        4.5,
        (homeRates.scored + awayRates.conceded) / 2
      )
    );

    // Attaque extérieure confrontée à la défense domicile.
    const expectedAwayGoals = Math.max(
      0.15,
      Math.min(
        4.5,
        (awayRates.scored + homeRates.conceded) / 2
      )
    );

    const matrix = this.buildScoreMatrix(
      expectedHomeGoals,
      expectedAwayGoals
    );

    let homeWin = 0;
    let draw = 0;
    let awayWin = 0;
    let over25 = 0;
    let bothTeamsScore = 0;

    for (const score of matrix) {

      if (score.homeGoals > score.awayGoals) {
        homeWin += score.probability;
      } else if (score.homeGoals === score.awayGoals) {
        draw += score.probability;
      } else {
        awayWin += score.probability;
      }

      if (score.homeGoals + score.awayGoals >= 3) {
        over25 += score.probability;
      }

      if (score.homeGoals > 0 && score.awayGoals > 0) {
        bothTeamsScore += score.probability;
      }
    }

    const topScores = [...matrix]
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5)
      .map(score => ({
        score: `${score.homeGoals}-${score.awayGoals}`,
        probability: Number(
          (score.probability * 100).toFixed(1)
        )
      }));

    const confidence = this.getConfidence(
      homeStats,
      awayStats,
      homeRates,
      awayRates
    );

    const percent = value => Number(
      (value * 100).toFixed(1)
    );

    return {
      available: true,

      model: "Poisson",
      version: "1.0",

      expectedGoals: {
        home: Number(expectedHomeGoals.toFixed(2)),
        away: Number(expectedAwayGoals.toFixed(2))
      },

      probabilities: {
        homeWin: percent(homeWin),
        draw: percent(draw),
        awayWin: percent(awayWin),
        over25: percent(over25),
        under25: percent(1 - over25),
        bothTeamsScore: percent(bothTeamsScore),
        atLeastOneCleanSheet: percent(1 - bothTeamsScore)
      },

      mostLikelyScores: topScores,

      confidence,

      data: {
        homeMatches: homeStats.matches,
        awayMatches: awayStats.matches,
        homeSource: homeRates.source,
        awaySource: awayRates.source
      },

      warning: "Estimation statistique indicative, non garantie. Ce modèle ne constitue pas un conseil de pari."
    };
  }

};

window.SPORTPULSE_PREDICTION = PredictionEngine;

console.log("SPORTPULSE AI — Moteur prédictif chargé");
