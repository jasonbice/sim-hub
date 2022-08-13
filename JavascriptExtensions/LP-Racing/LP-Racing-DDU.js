/**
 * Calculates the rate of change in the lap delta relative to the optimal lap.
 * @returns The delta's rage of change, as a decimal value.
 */
 function calcDeltaOptimalLapRateOfChange() {
    const rootKeyLastLapDelta = 'lastLapDeltaToOptimalLap';
    const lastLapDelta = root[rootKeyLastLapDelta];
    const newLapDelta = $prop('GameRawData.Telemetry.LapDeltaToSessionOptimalLap');

    root[rootKeyLastLapDelta] = newLapDelta;

    return newLapDelta - lastLapDelta;
}

/**
 * Determines the expected number of laps remaining. If this is a timed race, 
 * this is based on the remaining session time and the best lap time. If the 
 * number of race laps is predetermined, then the system's own value for 
 * remaining laps is returned.
 * @param {number} lapTimeBasis The lap time basis in seconds.
 * @returns The expected number of laps remaining.
 */
function calcExpectedLapsRemaining(lapTimeBasis) {
    const secondsRemaining = timespantoseconds($prop('SessionTimeLeft'));
    const expectedRemainingLaps = calcExpectedLaps(secondsRemaining, lapTimeBasis);
    const remainingLaps = $prop('RemainingLaps');

    return Math.min(expectedRemainingLaps, remainingLaps);
}

/**
 * Calculates the number of expected laps.
 * @param {number} raceDuration The number of seconds in the race, or that are
 * remaining.
 * @param {number} lapTimeBasis The lap time basis in seconds.
 * @returns The number of expected laps.
 */
function calcExpectedLaps(raceDuration, lapTimeBasis) {
    if (lapTimeBasis == 0 || raceDuration < lapTimeBasis) return 0;

    return (raceDuration / lapTimeBasis) + 1;
}

/**
 * Calculates the expected fuel requirements for a given race duration and rate
 * of fuel consumption.
 * @param {number} raceDuration The expected race duration in seconds.
 * @param {number} litersPerLap The liters consumed per lap.
 * @param {number} lapTimeBasis The lap time basis, in seconds, to be used for 
 * the calculation.
 * @returns The total fuel load requirement in liters.
 */
function calcExpectedFuelRequirement(raceDuration, litersPerLap, lapTimeBasis) {
    const expectedLaps = calcExpectedLaps(raceDuration, lapTimeBasis);

    return expectedLaps * litersPerLap;
}

/**
 * Calculates the expected fuel requirements for a given race duration, using 
 * the current driver's best lap time as the lap time basis, and using the 
 * current driver's liters/lap as the fuel consumption basis.
 * @param {*} raceDuration The race duration in seconds.
 * @returns The total fuel load requirement in liters.
 */
function autoCalcExpectedFuelRequirement(raceDuration) {
    const bestLapTimeSeconds = timespantoseconds($prop('BestLapTime'));
    const litersPerLap = $prop('DataCorePlugin.Computed.Fuel_LitersPerLap');

    if (bestLapTimeSeconds == 0 || litersPerLap == 0) return 0;

    const rootKey = 'expectedFuel_' + raceDuration;

    root[rootKey] = calcExpectedFuelRequirement(raceDuration, litersPerLap, bestLapTimeSeconds);

    return root[rootKey];
}