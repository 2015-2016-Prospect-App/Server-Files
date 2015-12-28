/**
 * Created by Tyler on 12/12/2015.
 */

const SCORE_CHANGE_SPEED = 15; // The rate at which scores change, Reasonable values are between 3.5 and 25
const LUCK_FACTOR = 175; // In relation to combined mean skill
const ADDED_DYNAMICS = 16; // The uncertainty added after each match in relation to player variances`
const CONSISTENCY_IMPORTANCE = 0.8; // Standard deviation multiplier can also be considered as uncertainty importance

const ADJUSTED_LUCK_FACTOR = Math.pow(LUCK_FACTOR, 2);

/*
 Default values = (1200, 400) (mean, stdDev)
*/

function rankingSystem(winningPlayerMean, winningPlayerStandardDeviation, losingPlayerMean, losingPlayerStandardDeviation) {

    // Initial Calculations
    var combinedMean = winningPlayerMean - losingPlayerMean;
    var winningPlayerVariance = Math.pow(winningPlayerStandardDeviation, 2);
    var losingPlayerVariance = Math.pow(losingPlayerStandardDeviation, 2);
    var totalVariance = (2 * ADJUSTED_LUCK_FACTOR) + winningPlayerVariance + losingPlayerVariance;
    var totalStandardDeviation = Math.sqrt(totalVariance);
    var adjustedScoreChangeSpeed = SCORE_CHANGE_SPEED / totalStandardDeviation;
    var adjustedCombinedMean = (combinedMean / totalStandardDeviation) - adjustedScoreChangeSpeed;

    // Advanced Statistics Calculations
    function pdf(x) {
        return (Math.exp(-Math.pow(x, 2) / 2)) / (Math.sqrt(2 * Math.PI));
    }

    function cdf(x) // Credit to Thomaschaaf on stack overflow for cdf function: http://stackoverflow.com/questions/5259421/cumulative-distribution-function-in-javascript
    {
        var z = (x) / Math.sqrt(2);
        var t = 1 / (1 + 0.3275911 * Math.abs(z));
        var a1 = 0.254829592;
        var a2 = -0.284496736;
        var a3 = 1.421413741;
        var a4 = -1.453152027;
        var a5 = 1.061405429;
        var erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
        var sign = 1;
        if (z < 0) {
            sign = -1;
        }
        return (1 / 2) * (1 + sign * erf);
    }

    // Change in Mean and Change in Standard Deviation Components
    var meanChangeComponent = pdf(adjustedCombinedMean) / cdf(adjustedCombinedMean);
    var varianceChangeComponent = meanChangeComponent * (meanChangeComponent + adjustedCombinedMean);

    // Variables of Interest
    var newWinningPlayerMean = winningPlayerMean + (winningPlayerVariance / totalStandardDeviation) * meanChangeComponent;
    var newLosingPlayerMean = losingPlayerMean - (losingPlayerVariance / totalStandardDeviation) * meanChangeComponent;
    var newWinningPlayerStandardDeviation = Math.sqrt(ADDED_DYNAMICS + winningPlayerVariance * (1 - (winningPlayerVariance / totalVariance) * varianceChangeComponent));
    var newLosingPlayerStandardDeviation = Math.sqrt(ADDED_DYNAMICS + losingPlayerVariance * (1 - (losingPlayerVariance / totalVariance) * varianceChangeComponent));
    var winningPlayerSkill = newWinningPlayerMean - CONSISTENCY_IMPORTANCE * newWinningPlayerStandardDeviation;
    var losingPlayerSkill = newLosingPlayerMean - CONSISTENCY_IMPORTANCE * newLosingPlayerStandardDeviation;

/*    console.log("New winning player mean: " + newWinningPlayerMean);
    console.log("New losing player mean: " + newLosingPlayerMean);
    console.log("New winning player standard deviation: " + newWinningPlayerStandardDeviation);
    console.log("New losing player standard deviation: " + newLosingPlayerStandardDeviation);
    console.log("New winning player skill: " + winningPlayerSkill);
    console.log("New losing player skill: " + losingPlayerSkill);*/

    return [[newWinningPlayerMean, newWinningPlayerStandardDeviation, winningPlayerSkill], [newLosingPlayerMean, newLosingPlayerStandardDeviation, losingPlayerSkill]];

}

// Reveal function
module.exports.rankingSystem = rankingSystem;