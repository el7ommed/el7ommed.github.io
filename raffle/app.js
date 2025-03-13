let availableNumbers = [];
// let prizes = ['iPad Pro', 'iPhone 16 Pro Max', 'Macbook Pro', 'Apple Watch', 'AirPods Pro'];

function initializeNumbers() {
    const min = 1
    const max = parseInt(document.getElementById('max').value, 10);

    if (isNaN(min) || isNaN(max) || min > max) {
        alert("Please enter valid numbers with Min less than or equal to Max.");
        return;
    }

    availableNumbers = [];
    for (let i = min; i <= max; i++) {
        availableNumbers.push(i);
    }
}

function raffleNumber() {
    if (availableNumbers.length === 0) {
        alert("All numbers have been used! Change Min/Max or refresh the page to start over.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers.splice(randomIndex, 1)[0];

    document.getElementById('result').textContent = randomNumber;
}

// Initialize numbers when the page loads
initializeNumbers();
