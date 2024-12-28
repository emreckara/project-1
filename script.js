// DOM elements
const setupSection = document.getElementById('setupSection');
const timerSection = document.getElementById('timerSection');
const resultsSection = document.getElementById('resultsSection');
const monthlySalaryInput = document.getElementById('monthlySalary');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const timeSpentDisplay = document.getElementById('timeSpent');
const earningsDisplay = document.getElementById('earnings');

// Variables
let startTime;
let timerInterval;
let isRunning = false;

// Event listeners
startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', reset);

// Functions
function startTimer() {
    const salary = parseFloat(monthlySalaryInput.value);
    if (!salary || salary <= 0) {
        alert('Please enter a valid monthly salary!');
        return;
    }

    setupSection.classList.add('hidden');
    timerSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    startTime = new Date();
    isRunning = true;
    
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date();
    const diff = new Date(currentTime - startTime);
    const minutes = diff.getUTCMinutes();
    const seconds = diff.getUTCSeconds();

    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    
    const endTime = new Date();
    const totalSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const monthlySalary = parseFloat(monthlySalaryInput.value);
    const hourlyRate = monthlySalary / (21 * 8); // Assuming 21 working days per month, 8 hours per day
    const minuteRate = hourlyRate / 60;
    const earnings = (totalSeconds / 60) * minuteRate;

    timeSpentDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    earningsDisplay.textContent = `${earnings.toFixed(2)}€`;

    timerSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

function reset() {
    clearInterval(timerInterval);
    minutesDisplay.textContent = '00';
    secondsDisplay.textContent = '00';
    monthlySalaryInput.value = '';
    
    setupSection.classList.remove('hidden');
    timerSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
} 