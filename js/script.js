/**
 * Pilot Training Tools - JavaScript with Tab Interface Logic
 *
 * Handles tab switching and the logic for the interactive pilot calculation quizzes.
 * Descent calculator altitudes are multiples of 500ft.
 * Descent calculator rates are limited to 500 or 1000 fpm.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const CORRECT_MESSAGE = 'Correct!';
    const INCORRECT_MESSAGE = 'Incorrect!';
    const RESULT_DISPLAY_TIME = 2000; // ms

    // --- State Variables ---
    let correctStreakRunway = 0;
    let correctStreakDescent = 0;
    let correctStreakPressure = 0;
    let correctStreakDensity = 0;

    // Store correct answers for each module
    let correctRunwaySide = '';
    let correctDescentDistance = 0;
    let correctPressureAltitudeValue = 0;
    let correctDensityAltitudeValue = 0;

    // --- DOM Element References ---
    // Shared
    const resultFeedbackElements = document.querySelectorAll('.result-feedback');

    // Tabs
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    // Runway Selection
    const tileRunway = document.getElementById('tile-runway');
    const streakRunwayEl = document.getElementById('streak-runway');
    const runwayLeftEl = document.getElementById('runway-left'); // Number element
    const runwayRightEl = document.getElementById('runway-right'); // Number element
    const optionLeftEl = document.getElementById('option-left');
    const optionRightEl = document.getElementById('option-right');
    const windDirectionEl = document.getElementById('wind-direction');
    const windArrowContainer = document.getElementById('wind-arrow-container');
    const windArrowIndicator = document.querySelector('.wind-arrow-indicator');
    const showWindHintBtn = document.getElementById('show-wind-hint-btn');
    const runwayGraphicEl = document.getElementById('runway-graphic');
    const resultRunwayEl = document.getElementById('result-runway');
    const runwayOptionLeftBtn = document.getElementById('runway-option-left');
    const runwayOptionRightBtn = document.getElementById('runway-option-right');
    const runwayOptionBtns = [runwayOptionLeftBtn, runwayOptionRightBtn];

    // Descent Calculator
    const tileDescent = document.getElementById('tile-descent');
    const streakDescentEl = document.getElementById('streak-descent');
    const currentAltitudeEl = document.getElementById('current-altitude');
    const targetAltitudeEl = document.getElementById('target-altitude');
    const speedEl = document.getElementById('speed');
    const descentRateEl = document.getElementById('descent-rate');
    const resultDescentEl = document.getElementById('result-descent');
    const descentOptionBtns = document.querySelectorAll('.descent-option');

    // Pressure Altitude
    const tilePressure = document.getElementById('tile-pressure-altitude');
    const streakPressureEl = document.getElementById('streak-pressure-altitude');
    const fieldElevationPressureEl = document.getElementById('field-elevation-pressure');
    const altimeterSettingPressureEl = document.getElementById('altimeter-setting-pressure');
    const resultPressureEl = document.getElementById('result-pressure-altitude');
    const pressureOptionBtns = document.querySelectorAll('.pressure-option');

    // Density Altitude
    const tileDensity = document.getElementById('tile-density-altitude');
    const streakDensityEl = document.getElementById('streak-density-altitude');
    const pressureAltitudeEl = document.getElementById('pressure-altitude');
    const temperatureEl = document.getElementById('temperature');
    const resultDensityEl = document.getElementById('result-density-altitude');
    const densityOptionBtns = document.querySelectorAll('.density-option');


    // --- Helper Functions ---

    /** Generates random integer */
    function getRandomInt(min, max) {
        min = Math.ceil(min); max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /** Generates random float */
    function getRandomFloat(min, max) { return Math.random() * (max - min) + min; }
    /** Shuffles array */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        } return array;
    }
    /** Pads number with leading zeros */
    function padNumber(num, size) { let s = "000" + num; return s.substr(s.length - size); }
    /** Updates streak and feedback message */
    function updateFeedback(isCorrect, streakElement, resultElement, currentStreak) {
        let updatedStreak = currentStreak;
        if (isCorrect) {
            updatedStreak++;
            resultElement.textContent = CORRECT_MESSAGE;
            resultElement.classList.remove('text-incorrect'); resultElement.classList.add('text-correct');
        } else {
            updatedStreak = 0;
            resultElement.textContent = INCORRECT_MESSAGE;
            resultElement.classList.remove('text-correct'); resultElement.classList.add('text-incorrect');
        }
        streakElement.textContent = `Streak: ${updatedStreak}`;
        return updatedStreak;
    }
    /** Disables buttons */
    function disableButtons(buttons) {
        if (buttons instanceof HTMLElement) { buttons.disabled = true; }
        else { buttons.forEach(button => button.disabled = true); }
    }
    /** Enables buttons */
    function enableButtons(buttons) {
         if (buttons instanceof HTMLElement) { buttons.disabled = false; }
         else { buttons.forEach(button => button.disabled = false); }
    }
    /** Clears result feedback */
    function clearResults() {
         resultFeedbackElements.forEach(el => {
            el.textContent = ''; el.classList.remove('text-correct', 'text-incorrect');
         });
    }

    // --- Tab Switching Logic ---
    function handleTabClick(event) {
        const clickedTab = event.currentTarget;
        const targetPanelId = clickedTab.getAttribute('aria-controls');

        // Deactivate all tabs and hide all panels
        tabButtons.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.classList.remove('border-secondary', 'text-secondary', 'font-semibold'); // Adjust classes based on your active style
            tab.classList.add('border-transparent', 'text-gray-500');
        });
        tabPanels.forEach(panel => {
            panel.classList.add('hidden');
        });

        // Activate the clicked tab and show its panel
        clickedTab.setAttribute('aria-selected', 'true');
        clickedTab.classList.add('border-secondary', 'text-secondary', 'font-semibold');
        clickedTab.classList.remove('border-transparent', 'text-gray-500');

        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
            targetPanel.classList.remove('hidden');
        }
    }

    // Attach event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });


    // --- Runway Selection ---
    function generateScenarioRunway() {
        clearResults();
        if (windArrowContainer) windArrowContainer.classList.add('hidden');
        if (showWindHintBtn) enableButtons(showWindHintBtn);

        const runway1 = getRandomInt(1, 36);
        const runway2 = runway1 <= 18 ? runway1 + 18 : runway1 - 18;
        const windDirection = getRandomInt(1, 360); // FROM

        const windDirectionFormatted = padNumber(windDirection, 3);
        const runway1Formatted = padNumber(runway1, 2);
        const runway2Formatted = padNumber(runway2, 2);

        runwayLeftEl.textContent = runway1Formatted;
        runwayRightEl.textContent = runway2Formatted;
        optionLeftEl.textContent = runway1Formatted;
        optionRightEl.textContent = runway2Formatted;
        windDirectionEl.textContent = `Wind: ${windDirectionFormatted}°`;

        const runwayHeading = runway1 * 10;
        const cssRunwayRotation = runwayHeading - 90;
        const numberCounterRotation = -cssRunwayRotation;

        if (runwayGraphicEl) { runwayGraphicEl.style.transform = `rotate(${cssRunwayRotation}deg)`; }
        if (runwayLeftEl) { runwayLeftEl.style.transform = `rotate(${numberCounterRotation}deg)`; }
        if (runwayRightEl) { runwayRightEl.style.transform = `rotate(${numberCounterRotation}deg)`; }
        if (windArrowIndicator) {
             const windArrowRotation = windDirection + 180; // Point away from source
             windArrowIndicator.style.transform = `rotate(${windArrowRotation}deg)`;
        }

        const heading1 = runway1 * 10; const heading2 = runway2 * 10;
        let diff1 = Math.abs(heading1 - windDirection); let diff2 = Math.abs(heading2 - windDirection);
        diff1 = diff1 > 180 ? 360 - diff1 : diff1; diff2 = diff2 > 180 ? 360 - diff2 : diff2;
        correctRunwaySide = diff1 <= diff2 ? 'left' : 'right';

        enableButtons(runwayOptionBtns);
    }
    function handleRunwaySelection(selectedSide) {
        disableButtons(runwayOptionBtns); disableButtons(showWindHintBtn);
        const isCorrect = selectedSide === correctRunwaySide;
        correctStreakRunway = updateFeedback(isCorrect, streakRunwayEl, resultRunwayEl, correctStreakRunway);
        if (windArrowContainer) windArrowContainer.classList.remove('hidden'); // Show hint after answer
        setTimeout(generateScenarioRunway, RESULT_DISPLAY_TIME);
    }
    function handleShowWindHint() {
        if (windArrowContainer) { windArrowContainer.classList.remove('hidden'); }
        disableButtons(showWindHintBtn);
    }

    // --- Descent Calculator ---
    function calculateDescentDistance(currentAlt, targetAlt, speedKts, rateFpm) {
        if (rateFpm <= 0 || speedKts <=0) return 0;
        const deltaAltitude = currentAlt - targetAlt; if (deltaAltitude <= 0) return 0;
        const timeMinutes = deltaAltitude / rateFpm; const speedNMperMin = speedKts / 60;
        const distance = speedNMperMin * timeMinutes;
        // Round to one decimal place
        return Math.round(distance * 10) / 10;
    }
    function generateDescentChoices(correctDist, currentAlt, targetAlt, speedKts, rateFpm) {
        const choices = new Set([correctDist]);
        // *** Use only 500/1000 for potential incorrect rates ***
        const potentialRates = [500, 1000].filter(r => r !== rateFpm);
        const potentialSpeeds = [60, 90, 120, 150, 180].filter(s => s !== speedKts);

        // Generate plausible incorrect answers primarily by varying speed now,
        // as varying rate only offers one other option.
        while (choices.size < 4) {
            let incorrectDist = 0;
            // Prioritize varying speed if possible
            if (potentialSpeeds.length > 0 && (Math.random() > 0.3 || potentialRates.length === 0)) { // Increase chance of varying speed
                const randomSpeed = potentialSpeeds[getRandomInt(0, potentialSpeeds.length - 1)];
                incorrectDist = calculateDescentDistance(currentAlt, targetAlt, randomSpeed, rateFpm);
            }
            // Otherwise, vary rate if possible
            else if (potentialRates.length > 0) {
                const randomRate = potentialRates[0]; // Only one other option
                incorrectDist = calculateDescentDistance(currentAlt, targetAlt, speedKts, randomRate);
            }
            // Fallback: Simple variation
            else {
                 incorrectDist = Math.max(1, correctDist + getRandomInt(-5, 5) * (Math.random() + 0.5));
                 incorrectDist = Math.round(incorrectDist * 10) / 10;
            }

            // Ensure positive distance, avoid duplicates, and prevent tiny variations
            if (incorrectDist > 0 && !choices.has(incorrectDist) && Math.abs(incorrectDist - correctDist) > 0.2) {
                 choices.add(incorrectDist);
            }
            if (choices.size < 4 && choices.size > 10) { console.warn("Descent choice gen safety break."); break; };
        }
        // Add purely random options if still not enough choices
        while (choices.size < 4) {
            const randomDist = Math.max(1, correctDist + getRandomInt(-15, 15) * (Math.random() * 0.5 + 0.5));
            const roundedRandom = Math.round(randomDist * 10) / 10;
            if(roundedRandom > 0 && !choices.has(roundedRandom) && Math.abs(roundedRandom - correctDist) > 0.2) choices.add(roundedRandom);
        }
        return shuffleArray(Array.from(choices));
    }
    function generateScenarioDescent() {
        clearResults();
        const speedOptions = [90, 120, 150, 180];
        // *** Limit descent rate options ***
        const descentRateOptions = [500, 1000];

        // Generate altitudes as multiples of 500
        const currentAltIncrements = getRandomInt(16, 36); // 8000 to 18000 ft
        const currentAltitude = currentAltIncrements * 500;
        const maxTargetIncrements = currentAltIncrements - 2; // Ensure at least 1000ft difference
        const targetAltIncrements = getRandomInt(4, maxTargetIncrements); // Min 2000ft
        const targetAltitude = targetAltIncrements * 500;

        // Select speed and limited descent rate
        const speed = speedOptions[getRandomInt(0, speedOptions.length - 1)];
        const descentRate = descentRateOptions[getRandomInt(0, descentRateOptions.length - 1)]; // Will pick 500 or 1000

        correctDescentDistance = calculateDescentDistance(currentAltitude, targetAltitude, speed, descentRate);

        // Regenerate if calculation yields extreme or zero results
        if (correctDescentDistance <= 0 || correctDescentDistance > 150) {
            generateScenarioDescent();
            return;
        }

        const choices = generateDescentChoices(correctDescentDistance, currentAltitude, targetAltitude, speed, descentRate);

        // Update UI
        currentAltitudeEl.textContent = `${currentAltitude} ft`;
        targetAltitudeEl.textContent = `${targetAltitude} ft`;
        speedEl.textContent = `${speed} kts`;
        descentRateEl.textContent = `${descentRate} fpm`;

        descentOptionBtns.forEach((button, index) => {
            const val = choices[index] !== undefined ? choices[index] : Math.round(correctDescentDistance + index + 1);
            button.textContent = `${val} miles`; button.dataset.value = val;
        });
        enableButtons(descentOptionBtns);
    }
    function handleDescentSelection(button) {
        disableButtons(descentOptionBtns);
        const selectedDistance = parseFloat(button.dataset.value);
        const isCorrect = selectedDistance === correctDescentDistance;
        correctStreakDescent = updateFeedback(isCorrect, streakDescentEl, resultDescentEl, correctStreakDescent);
        setTimeout(generateScenarioDescent, RESULT_DISPLAY_TIME);
    }

    // --- Pressure Altitude ---
    function calculatePressureAltitude(fieldElevation, altimeterSetting) {
        const pressureAltitude = fieldElevation + (29.92 - altimeterSetting) * 1000;
        return Math.round(pressureAltitude);
    }
    function generatePressureChoices(correctPA) {
        const choices = new Set([correctPA]);
        while (choices.size < 4) {
            const variation = getRandomInt(-15, 15) * 100;
            const incorrectPA = correctPA + (variation !== 0 ? variation : (Math.random() > 0.5 ? 100 : -100));
             if (!choices.has(incorrectPA)) { choices.add(incorrectPA); }
        } return shuffleArray(Array.from(choices));
    }
    function generateScenarioPressure() {
        clearResults();
        const fieldElevation = getRandomInt(0, 80) * 100;
        const altimeterSetting = (getRandomFloat(28.00, 31.00)).toFixed(2);
        correctPressureAltitudeValue = calculatePressureAltitude(fieldElevation, altimeterSetting);
        const choices = generatePressureChoices(correctPressureAltitudeValue);
        fieldElevationPressureEl.textContent = `${fieldElevation} ft`;
        altimeterSettingPressureEl.textContent = `${altimeterSetting} inHg`;
        pressureOptionBtns.forEach((button, index) => {
             button.textContent = `${choices[index]} ft`; button.dataset.value = choices[index];
        });
        enableButtons(pressureOptionBtns);
    }
    function handlePressureSelection(button) {
        disableButtons(pressureOptionBtns);
        const selectedAltitude = parseInt(button.dataset.value, 10);
        const isCorrect = selectedAltitude === correctPressureAltitudeValue;
        correctStreakPressure = updateFeedback(isCorrect, streakPressureEl, resultPressureEl, correctStreakPressure);
        setTimeout(generateScenarioPressure, RESULT_DISPLAY_TIME);
    }

    // --- Density Altitude ---
    function calculateDensityAltitude(pressureAltitude, temperatureCelsius) {
        const isaTemp = 15 - (pressureAltitude / 1000) * 2;
        const densityAltitude = pressureAltitude + 120 * (temperatureCelsius - isaTemp);
        return Math.round(densityAltitude);
    }
     function generateDensityChoices(correctDA) {
        const choices = new Set([correctDA]);
        while (choices.size < 4) {
            const variation = getRandomInt(-25, 25) * 100;
            const incorrectDA = correctDA + (variation !== 0 ? variation : (Math.random() > 0.5 ? 100 : -100));
            if(incorrectDA > -5000 && !choices.has(incorrectDA)) { choices.add(incorrectDA); }
        } return shuffleArray(Array.from(choices));
    }
    function generateScenarioDensity() {
        clearResults();
        const pressureAltitude = getRandomInt(-10, 100) * 100;
        const temperature = getRandomInt(-10, 45);
        correctDensityAltitudeValue = calculateDensityAltitude(pressureAltitude, temperature);
        const choices = generateDensityChoices(correctDensityAltitudeValue);
        pressureAltitudeEl.textContent = `${pressureAltitude} ft`;
        temperatureEl.textContent = `${temperature}°C`;
        densityOptionBtns.forEach((button, index) => {
            button.textContent = `${choices[index]} ft`; button.dataset.value = choices[index];
        });
        enableButtons(densityOptionBtns);
    }
    function handleDensitySelection(button) {
        disableButtons(densityOptionBtns);
        const selectedAltitude = parseInt(button.dataset.value, 10);
        const isCorrect = selectedAltitude === correctDensityAltitudeValue;
        correctStreakDensity = updateFeedback(isCorrect, streakDensityEl, resultDensityEl, correctStreakDensity);
        setTimeout(generateScenarioDensity, RESULT_DISPLAY_TIME);
    }

    // --- Event Listeners (Game Logic) ---
    if(runwayOptionLeftBtn) runwayOptionLeftBtn.addEventListener('click', () => handleRunwaySelection('left'));
    if(runwayOptionRightBtn) runwayOptionRightBtn.addEventListener('click', () => handleRunwaySelection('right'));
    if (showWindHintBtn) { showWindHintBtn.addEventListener('click', handleShowWindHint); }
    descentOptionBtns.forEach(button => { button.addEventListener('click', () => handleDescentSelection(button)); });
    pressureOptionBtns.forEach(button => { button.addEventListener('click', () => handlePressureSelection(button)); });
    densityOptionBtns.forEach(button => { button.addEventListener('click', () => handleDensitySelection(button)); });

    // --- Initial Scenario Generation ---
    // Generate scenarios for all tabs on load, even if hidden initially
    generateScenarioRunway();
    generateScenarioDescent();
    generateScenarioPressure();
    generateScenarioDensity();

}); // End DOMContentLoaded
