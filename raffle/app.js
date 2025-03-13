let availableNumbers = [];
let prizes = ['iPad Pro', 'iPhone 16 Pro Max', 'Macbook Pro', 'Apple Watch', 'AirPods Pro'];
let currentPrizeIndex = 0;

function initializeNumbers() {
    const min = 1;
    const max = parseInt(document.getElementById('max')?.value || 100, 10);

    if (isNaN(min) || isNaN(max) || min > max) {
        alert("Please enter a valid max number.");
        return;
    }

    availableNumbers = [];
    for (let i = min; i <= max; i++) {
        availableNumbers.push(i);
    }
    updatePrizeDisplay();
}

function raffleNumber() {
    if (availableNumbers.length === 0) {
        alert("All numbers have been used! Change Max or refresh the page to start over.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers.splice(randomIndex, 1)[0];
    document.getElementById('result').textContent = randomNumber;

    appendWinner(prizes[currentPrizeIndex], randomNumber);
}

function nextPrize() {
    currentPrizeIndex = (currentPrizeIndex + 1) % prizes.length;
    updatePrizeDisplay();
}

function updatePrizeDisplay() {
    document.getElementById('prize-title').textContent = prizes[currentPrizeIndex];
}

function appendWinner(prize, number) {
    const winnersList = document.getElementById('winners-list');
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.textContent = `${prize}: ${number}`;
    winnersList.appendChild(li);
}

// Initialize numbers when the page loads
initializeNumbers();
