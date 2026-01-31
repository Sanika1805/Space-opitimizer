function calculateScoreFromWork({ timeMinutes, plantsPlanted, areaCleanedSqm, wasteGatheredKg }) {
  const coinsPerMin = 0.5;
  const coinsPerPlant = 10;
  const coinsPerSqm = 0.2;
  const coinsPerKg = 2;
  const coins =
    timeMinutes * coinsPerMin +
    plantsPlanted * coinsPerPlant +
    areaCleanedSqm * coinsPerSqm +
    wasteGatheredKg * coinsPerKg;
  const aqiReduced = Math.round(areaCleanedSqm * 0.01 + plantsPlanted * 0.5);
  const carbonFootprintReducedKg = Math.round(wasteGatheredKg * 2 + plantsPlanted * 5 + areaCleanedSqm * 0.02);
  return {
    coins: Math.round(coins),
    timeMinutes,
    plantsPlanted,
    areaCleanedSqm,
    wasteGatheredKg,
    aqiReduced,
    carbonFootprintReducedKg
  };
}

async function applyConsistencyPenalty(score, user) {
  if (!user || !score) return null;
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const lastDriveMonth = user.lastDriveMonth ? new Date(user.lastDriveMonth) : null;
  const missedTwo = lastDriveMonth && lastDriveMonth < twoMonthsAgo && user.consecutiveMisses >= 2;
  if (missedTwo && !score.penaltyApplied) {
    score.coins = Math.floor(score.coins * 0.5);
    score.virtualJungleLevel = Math.floor(score.virtualJungleLevel * 0.5);
    score.penaltyApplied = true;
    return score;
  }
  return null;
}

module.exports = { calculateScoreFromWork, applyConsistencyPenalty };
