// import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
// import Swiper from 'raffle/swiper-bundle.min.js';

let availableNumbers = [];
let prizes = [
    { name: 'iPad Pro', image: 'images/100316144_100_02.webp', number: 0 },
    { name: 'iPhone 16 Pro Max', image: 'images/iphone_16_pro_max_desert_titanium_1.jpeg', number: 0 },
    { name: 'Macbook Pro', image: 'images/macbook_pro_16_inch_m4_pro_or_max_chip_space_black_1.jpeg', number: 0 },
    { name: 'Apple Watch', image: 'images/apple_watch_series_10_46mm_gps_jet_black_aluminum_sport_band_black_1.jpeg', number: 0 },
    { name: 'AirPods Pro', image: 'images/S400900642_1.jpeg', number: 0 }
];

// const swiper = new Swiper('.swiper', {
//     // Optional parameters
//     direction: 'vertical',
//     loop: true,

//     // If we need pagination
//     pagination: {
//         el: '.swiper-pagination',
//     },

//     // Navigation arrows
//     navigation: {
//         nextEl: '.swiper-button-next',
//         prevEl: '.swiper-button-prev',
//     },

//     // And if we need scrollbar
//     scrollbar: {
//         el: '.swiper-scrollbar',
//     },
// });

const swiper = new Swiper('.swiper', {
    effect: 'coverflow',
    // loop: true,
    grabCursor: true,
    centeredSlides: true,
    coverFlowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 4,
        slideShadows: false,
    },
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    keyboard: {
        enabled: true,
    },
    mousewheel: {
        thresholdDelta: 70
    },
    breakpoints: {
        560: {
            slidesPerView: 3
        },
        768: {
            slidesPerView: 3
        },
        1024: {
            slidesPerView: 3
        }
    }
});


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

    const displayElement = document.getElementById(`prize-number-${index}`);
    let shuffleCount = 30;
    let delay = 5;

    function shuffle() {
        if (shuffleCount > 0) {
            displayElement.textContent = Math.floor(Math.random() * parseInt(document.getElementById('max')?.value || 100, 10)) + 1;
            shuffleCount--;
            delay += 15;
            setTimeout(shuffle, delay);
        } else {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const randomNumber = availableNumbers.splice(randomIndex, 1)[0];
            prizes[index].number = randomNumber;
            displayElement.textContent = randomNumber;
        }
    }

    shuffle();
}

function renderCarousel() {
    const carouselContent = document.getElementById('dynamic-wrapper');
    carouselContent.innerHTML = '';

    prizes.forEach((prize, index) => {
        const activeClass = index === 0 ? 'active' : '';

        const card = `
            <div class="swiper-slide">
                <div class="slide-content">
                    <div class="card mx-auto text-center" style="width: 18rem;">
                        <img src="${prize.image}" class="card-img-top" alt="${prize.name}">
                        <div class="card-body">
                            <h5 class="card-title">${prize.name}</h5>
                            <button class="btn btn-success" onclick="raffleNumber(${index})">Shuffle</button>
                            <h2 id="prize-number-${index}" class="mt-3">${prize.number ?? '0'}</h2>
                        </div>
                    </div>
                </div>
            </div>
        `;

        carouselContent.innerHTML += card;
    });
}

initializeNumbers();
