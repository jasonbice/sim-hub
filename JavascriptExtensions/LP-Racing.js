const LP_PRIMARY_COLOR = '#ddff00';
const PIT_BOX_NEAR_THRESHOLD = 2.108;
const PIT_BOX_FAR_THRESHOLD = -1.8753;
const FEET_PER_METER = 3.28084;

function displayPitOverlay() {
    if ($prop('IsInPitLane') === 0) return false;

    return isDriverInFrontOfPitBox() || 
        $prop('GameRawData.Telemetry.PitStopActive') ||
        // The following checks prevent a momentary false-negative from when
        // the car stops within the pit box and pit service activates.
        !isTireServiceComplete() ||
        !isRefuelingComplete();
}

/**
 * Indicates whether the 'Go' indicator should be displayed after pit service 
 * has completed. Refueling must be completed (if applicable), the driver 
 * must be in the box, no tire changes may be outstanding, and the sim must
 * report that the pit stop is no longer active.
 */
function displayGoIndicator() {
    return isDriverInPitBox() && 
        !$prop('GameRawData.Telemetry.PitStopActive') && 
        // The following checks prevent a momentary false-positive from when
        // the car stops within the pit box and pit service activates.
        isTireServiceComplete() &&
        isRefuelingComplete();
}

/**
 * Indicates whether refueling has completed. This will report true if no
 * fuel service was requested or when the "fuel target" and actual fuel are
 * within 0.05L.
 */ 
function isRefuelingComplete() {
    return $prop('GameRawData.Telemetry.PitSvFuel') === 0 || 
        getRemainingRefuelLiters() < 0.05;
}

function isTireServiceComplete() {
    return $prop('DataCorePlugin.GameRawData.Telemetry.dpLFTireChange') === 0 &&
        $prop('DataCorePlugin.GameRawData.Telemetry.dpLRTireChange') === 0 &&
        $prop('DataCorePlugin.GameRawData.Telemetry.dpRFTireChange') === 0 &&
        $prop('DataCorePlugin.GameRawData.Telemetry.dpRRTireChange') === 0;
}

/**
 * Gets the fuel remaining in the refual service, as determined by the refuel
 * target minus the car's actual fuel.
 */ 
function getRemainingRefuelLiters() {
    return $prop('IRacingExtraProperties.iRacing_FuelRefuelTarget') - $prop('Fuel');
}

/**
 * Indicates whether it's estimated that the driver missed/overshot the pit box.
 */ 
function driverMissedPitBox() {
    return getAdjustedPitBoxDistanceInMeters() < 0;
}

/**
 * Gets the "adjusted" distance between the driver and the pit box. The 
 * adjustment referenced is the start of the pit box to the end of the pit box,
 * intended to be used to determine whether the driver is "close enough for 
 * pit service".
 */ 
function getAdjustedPitBoxDistanceInMeters() {
    const distance = $prop('IRacingExtraProperties.iRacing_DistanceToPitBox');

    let adjustedDistance = distance;

    if (distance >= PIT_BOX_NEAR_THRESHOLD) {
        adjustedDistance = distance - PIT_BOX_NEAR_THRESHOLD;
    }

    if (isDriverInPitBox()) return 0;

    if (distance <= PIT_BOX_FAR_THRESHOLD) {
        adjustedDistance = distance - PIT_BOX_FAR_THRESHOLD;
    }

    return adjustedDistance / FEET_PER_METER;
}

/**
 * Indicates whether the driver is anywhere in the pit box where pit service
 * can be provided.
 */ 
function isDriverInPitBox() {
    const distance = $prop('IRacingExtraProperties.iRacing_DistanceToPitBox');

    return distance <= PIT_BOX_NEAR_THRESHOLD && distance >= PIT_BOX_FAR_THRESHOLD;
}

/**
 * Indicates whether the driver is anywhere in front of their pit box.
 */ 
function isDriverInFrontOfPitBox() {
    const distance = $prop('IRacingExtraProperties.iRacing_DistanceToPitBox');

    return distance > PIT_BOX_NEAR_THRESHOLD;
}

/**
 * Indicates whether the driver is using an incorrect setup (such as a Q setup 
 * in a race situation).
 */ 
function displaySetupWarning() {
    return ($prop('SessionType') == 'Qualifying' && 
        $prop('SessionTimeLeft') == 0 &&
        $prop('GameRawData.SessionData.DriverInfo.DriverSetupName')?.indexOf('Q') > -1);
}

function getLicenseFgColor(color) {
    // Brighter Class A
    if (color == '#FF0153db') return '#FF00a7ff';

    // Brighter Class B
    if (color == '#6600c702') return '#FF00FF03';

    // Brighter Class R
    if (color == '#FFB40800') return '#FFFF0000';

    return color;
}

function getLicenseBgColor(color) {
    return adjustOpacity(color, '66');
}

function adjustOpacity(color, hexOpacity) {
    return `#${hexOpacity}${color.substring(3)}`;
}

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