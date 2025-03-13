let availableNumbers = [];
let prizes = [
    { name: 'iPad Pro', image: 'images/100316144_100_02.webp', number: 0 },
    { name: 'iPhone 16 Pro Max', image: 'images/iphone.jpg', number: 0 },
    { name: 'Macbook Pro', image: 'images/macbook.jpg', number: 0 },
    { name: 'Apple Watch', image: 'images/watch.jpg', number: 0 },
    { name: 'AirPods Pro', image: 'images/airpods.jpg', number: 0 }
];

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
    renderCarousel();
}

function raffleNumber(index) {
    if (availableNumbers.length === 0) {
        alert("All numbers have been used! Change Max or refresh the page to start over.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers.splice(randomIndex, 1)[0];
    prizes[index].number = randomNumber;
    document.getElementById(`prize-number-${index}`).textContent = randomNumber;
}

function renderCarousel() {
    const carouselContent = document.getElementById('carousel-content');
    carouselContent.innerHTML = '';

    prizes.forEach((prize, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const card = `
            <div class="carousel-item ${activeClass}">
                <div class="card mx-auto" style="width: 18rem;">
                    <img src="${prize.image}" class="card-img-top" alt="${prize.name}">
                    <div class="card-body">
                        <h5 class="card-title">${prize.name}</h5>
                        <button class="btn btn-success" onclick="raffleNumber(${index})">Shuffle</button>
                        <h2 id="prize-number-${index}" class="mt-3">${prize.number ?? '0'}</h2>
                    </div>
                </div>
            </div>
        `;
        carouselContent.innerHTML += card;
    });
}

// Initialize numbers and render carousel when the page loads
initializeNumbers();
