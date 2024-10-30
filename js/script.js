/* Shared Functions */
function padNumber(num, size) {
    let s = "000" + num;
    return s.substr(s.length - size);
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

/* Runway Selection App */
let correctStreakRunway = 0;

function generateScenarioRunway() {
    const runway1 = Math.floor(Math.random() * 36) + 1;
    const runway2 = runway1 <= 18 ? runway1 + 18 : runway1 - 18;
    const windDirection = Math.floor(Math.random() * 360) + 1;
    const windDirectionFormatted = padNumber(windDirection, 3);
    const runway1Formatted = padNumber(runway1, 2);
    const runway2Formatted = padNumber(runway2, 2);

    document.getElementById('runway-left').innerText = runway1Formatted;
    document.getElementById('runway-right').innerText = runway2Formatted;
    document.getElementById('option-left').innerText = runway1Formatted;
    document.getElementById('option-right').innerText = runway2Formatted;
    document.getElementById('wind-direction').innerText = 'Wind Direction: ' + windDirectionFormatted + '°';
    document.getElementById('result-runway').innerText = '';

    // Store data for use in selection
    const tileRunway = document.getElementById('tile-runway');
    tileRunway.dataset.runway1 = runway1;
    tileRunway.dataset.runway2 = runway2;
    tileRunway.dataset.windDirection = windDirection;
}

function selectRunway(selectedSide) {
    const tileRunway = document.getElementById('tile-runway');
    const runway1 = parseInt(tileRunway.dataset.runway1);
    const runway2 = parseInt(tileRunway.dataset.runway2);
    const windDirection = parseInt(tileRunway.dataset.windDirection);

    const heading1 = runway1 * 10;
    const heading2 = runway2 * 10;

    let diff1 = Math.abs(heading1 - windDirection);
    let diff2 = Math.abs(heading2 - windDirection);
    diff1 = diff1 > 180 ? 360 - diff1 : diff1;
    diff2 = diff2 > 180 ? 360 - diff2 : diff2;

    const correctSide = diff1 <= diff2 ? 'left' : 'right';
    const resultElement = document.getElementById('result-runway');

    if (selectedSide === correctSide) {
        correctStreakRunway++;
        resultElement.innerText = 'Correct!';
        resultElement.style.color = 'green';
    } else {
        correctStreakRunway = 0;
        resultElement.innerText = 'Incorrect!';
        resultElement.style.color = 'red';
    }

    document.getElementById('streak-runway').innerText = 'Streak: ' + correctStreakRunway;

    // Disable buttons
    document.querySelectorAll('.runway-option').forEach(button => button.disabled = true);

    setTimeout(() => {
        document.querySelectorAll('.runway-option').forEach(button => button.disabled = false);
        generateScenarioRunway();
    }, 2000);
}

/* Descent Calculator App */
let correctStreakDescent = 0;

function generateScenarioDescent() {
    const speedOptions = [60, 90, 120, 150];
    const descentRateOptions = [500, 1000];
    const altitudeOptions = Array.from({ length: 17 }, (_, i) => 3500 + i * 500);

    // Generate current scenario values
    const speed = speedOptions[Math.floor(Math.random() * speedOptions.length)];
    const descentRate = descentRateOptions[Math.floor(Math.random() * descentRateOptions.length)];
    const currentAltitude = altitudeOptions[Math.floor(Math.random() * altitudeOptions.length)];
    const targetAltitudeOptions = altitudeOptions.filter(alt => alt < currentAltitude);
    const targetAltitude = targetAltitudeOptions[Math.floor(Math.random() * targetAltitudeOptions.length)];

    // Calculate the correct distance
    const correctDistance = calculateDescentDistance(currentAltitude, targetAltitude, speed, descentRate);

    // Generate choices
    const choices = generateDescentChoices(correctDistance, currentAltitude, targetAltitude, speed, descentRate);

    // Update the display
    document.getElementById('current-altitude').innerText = currentAltitude + ' ft MSL';
    document.getElementById('target-altitude').innerText = targetAltitude + ' ft MSL';
    document.getElementById('speed').innerText = speed + ' knots';
    document.getElementById('descent-rate').innerText = descentRate + ' fpm';

    const buttons = document.querySelectorAll('.descent-option');
    buttons.forEach((button, index) => {
        button.innerText = choices[index] + ' miles';
        button.dataset.value = choices[index];
        button.disabled = false;
    });

    document.getElementById('result-descent').innerText = '';

    // Store correct distance
    document.getElementById('tile-descent').dataset.correctDistance = correctDistance;
}

function calculateDescentDistance(currentAltitude, targetAltitude, speed, descentRate) {
    const deltaAltitude = currentAltitude - targetAltitude; // in feet
    const timeInMinutes = deltaAltitude / descentRate; // time = deltaAltitude / descentRate
    const distance = parseFloat(((speed / 60) * timeInMinutes).toFixed(2)); // distance = speed * time
    return distance;
}

function generateDescentChoices(correctDistance, currentAltitude, targetAltitude, speed, descentRate) {
    const choicesSet = new Set([correctDistance]);
    const speedOptions = [60, 90, 120, 150];
    const descentRateOptions = [500, 1000];

    // Generate incorrect choices based on other plausible combinations
    while (choicesSet.size < 4) {
        // Randomly choose different speed or descent rate
        let altSpeed = speed;
        let altDescentRate = descentRate;

        if (Math.random() < 0.5) {
            // Change speed
            altSpeed = speedOptions.filter(s => s !== speed)[Math.floor(Math.random() * (speedOptions.length - 1))];
        } else {
            // Change descent rate
            altDescentRate = descentRateOptions.filter(dr => dr !== descentRate)[Math.floor(Math.random() * (descentRateOptions.length - 1))];
        }

        const altDistance = calculateDescentDistance(currentAltitude, targetAltitude, altSpeed, altDescentRate);
        if (altDistance > 0) {
            choicesSet.add(altDistance);
        }
    }

    const choices = shuffleArray(Array.from(choicesSet));
    return choices;
}

function selectDescentDistance(button) {
    const selectedDistance = parseFloat(button.dataset.value);
    const correctDistance = parseFloat(document.getElementById('tile-descent').dataset.correctDistance);
    const resultElement = document.getElementById('result-descent');

    if (selectedDistance === correctDistance) {
        correctStreakDescent++;
        resultElement.innerText = 'Correct!';
        resultElement.style.color = 'green';
    } else {
        correctStreakDescent = 0;
        resultElement.innerText = 'Incorrect!';
        resultElement.style.color = 'red';
    }

    document.getElementById('streak-descent').innerText = 'Streak: ' + correctStreakDescent;

    // Disable buttons
    document.querySelectorAll('.descent-option').forEach(btn => btn.disabled = true);
    setTimeout(generateScenarioDescent, 2000);
}

/* Pressure Altitude Calculator App */
let correctStreakPressure = 0;

function generateScenarioPressure() {
    const fieldElevation = Math.floor(Math.random() * 6501); // 0 to 6500 ft
    const altimeterSetting = (Math.random() * (32.00 - 28.00) + 28.00).toFixed(2); // 28.00 to 32.00 inHg

    // Calculate pressure altitude
    const correctPressureAltitude = calculatePressureAltitude(fieldElevation, altimeterSetting);

    // Generate choices
    const choices = generatePressureChoices(correctPressureAltitude);

    // Update the display
    document.getElementById('field-elevation-pressure').innerText = fieldElevation + ' ft MSL';
    document.getElementById('altimeter-setting-pressure').innerText = altimeterSetting + ' inHg';

    const buttons = document.querySelectorAll('.pressure-option');
    buttons.forEach((button, index) => {
        button.innerText = choices[index] + ' ft';
        button.dataset.value = choices[index];
        button.disabled = false;
    });

    document.getElementById('result-pressure-altitude').innerText = '';

    // Store correct pressure altitude
    document.getElementById('tile-pressure-altitude').dataset.correctPressureAltitude = correctPressureAltitude;
}

function calculatePressureAltitude(fieldElevation, altimeterSetting) {
    // Pressure altitude calculation
    const pressureAltitude = fieldElevation + (29.92 - altimeterSetting) * 1000;
    return Math.round(pressureAltitude);
}

function generatePressureChoices(correctPressureAltitude) {
    const choicesSet = new Set([correctPressureAltitude]);

    // Generate incorrect choices
    while (choicesSet.size < 4) {
        const variation = Math.floor(Math.random() * 1000) - 500;
        const altPressureAltitude = correctPressureAltitude + variation;
        choicesSet.add(altPressureAltitude);
    }

    const choices = shuffleArray(Array.from(choicesSet));
    return choices;
}

function selectPressureAltitude(button) {
    const selectedAltitude = parseInt(button.dataset.value);
    const correctAltitude = parseInt(document.getElementById('tile-pressure-altitude').dataset.correctPressureAltitude);
    const resultElement = document.getElementById('result-pressure-altitude');

    if (selectedAltitude === correctAltitude) {
        correctStreakPressure++;
        resultElement.innerText = 'Correct!';
        resultElement.style.color = 'green';
    } else {
        correctStreakPressure = 0;
        resultElement.innerText = 'Incorrect!';
        resultElement.style.color = 'red';
    }

    document.getElementById('streak-pressure-altitude').innerText = 'Streak: ' + correctStreakPressure;

    // Disable buttons
    document.querySelectorAll('.pressure-option').forEach(btn => btn.disabled = true);
    setTimeout(generateScenarioPressure, 2000);
}

/* Density Altitude Calculator App */
let correctStreakDensity = 0;

function generateScenarioDensity() {
    const pressureAltitude = Math.floor(Math.random() * 8001); // 0 to 8000 ft
    const temperature = Math.floor(Math.random() * 101); // 0 to 100°C

    // Calculate the correct density altitude
    const correctDensityAltitude = calculateDensityAltitude(pressureAltitude, temperature);

    // Generate choices
    const choices = generateDensityChoices(correctDensityAltitude);

    // Update the display
    document.getElementById('pressure-altitude').innerText = pressureAltitude + ' ft';
    document.getElementById('temperature').innerText = temperature + '°C';

    const buttons = document.querySelectorAll('.density-option');
    buttons.forEach((button, index) => {
        button.innerText = choices[index] + ' ft';
        button.dataset.value = choices[index];
        button.disabled = false;
    });

    document.getElementById('result-density-altitude').innerText = '';

    // Store correct density altitude
    document.getElementById('tile-density-altitude').dataset.correctDensityAltitude = correctDensityAltitude;
}

function calculateDensityAltitude(pressureAltitude, temperature) {
    // Simplified density altitude formula
    const isaTemperature = 15 - (pressureAltitude / 1000) * 2;
    const temperatureDifference = temperature - isaTemperature;
    const densityAltitude = pressureAltitude + (120 * temperatureDifference);
    return Math.round(densityAltitude);
}

function generateDensityChoices(correctDensityAltitude) {
    const choicesSet = new Set([correctDensityAltitude]);

    // Generate incorrect choices
    while (choicesSet.size < 4) {
        const variation = Math.floor(Math.random() * 1000) - 500;
        const altDensityAltitude = correctDensityAltitude + variation;
        choicesSet.add(altDensityAltitude);
    }

    const choices = shuffleArray(Array.from(choicesSet));
    return choices;
}

function selectDensityAltitude(button) {
    const selectedAltitude = parseInt(button.dataset.value);
    const correctAltitude = parseInt(document.getElementById('tile-density-altitude').dataset.correctDensityAltitude);
    const resultElement = document.getElementById('result-density-altitude');

    if (selectedAltitude === correctAltitude) {
        correctStreakDensity++;
        resultElement.innerText = 'Correct!';
        resultElement.style.color = 'green';
    } else {
        correctStreakDensity = 0;
        resultElement.innerText = 'Incorrect!';
        resultElement.style.color = 'red';
    }

    document.getElementById('streak-density-altitude').innerText = 'Streak: ' + correctStreakDensity;

    // Disable buttons
    document.querySelectorAll('.density-option').forEach(btn => btn.disabled = true);
    setTimeout(generateScenarioDensity, 2000);
}

// Initialize apps
generateScenarioPressure();
generateScenarioDensity();
generateScenarioRunway();
generateScenarioDescent();
