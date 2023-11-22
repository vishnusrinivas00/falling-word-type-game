const heartsContainer = document.getElementById("hearts-container");
let hearts = 3;
let score = 0;

function createHeart() {
    for (let i = 0; i < hearts; i++) {
        const heart = document.createElement("span");
        heart.className = "heart";
        heart.innerHTML = "❤";
        heartsContainer.appendChild(heart);
    }
}

function removeHeart() {
    const lastHeart = heartsContainer.lastChild;
    if (lastHeart) {
        heartsContainer.removeChild(lastHeart);
        hearts--;
    }
}

const scoreElement = document.getElementById("Score");

function updateScore() {
    scoreElement.innerHTML = `<p>Score: ${score}</p>`;
}

const difficultyLevels = [
    { interval: 2000, speed: 3 },
    { interval: 1500, speed: 2 },
    { interval: 1000, speed: 2 }
];

let currentLevel = 0;
let intervalId;
let gameStarted = false; // Flag to track whether the game is currently running

const apiUrl = 'https://random-word-api.herokuapp.com/word';

function getRandomWord() {
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => data[0]);
}

async function nextWord() {
    try {
        const wordText = await getRandomWord();
        const word = document.createElement("div");
        word.className = "word";
        word.innerText = wordText;
        word.style.left = `${Math.random() * 250}px`;
        document.getElementById("game-container").appendChild(word);
        return word;
    } catch (error) {
        console.error('Error fetching random word:', error);
        return null;
    }
}

function checkCollision(word) {
    const wordBottom = word.offsetTop + word.offsetHeight;

    if (wordBottom > 400) {
        if (!word.classList.contains("typed")) {
            removeHeart();
        }
        word.remove();
        if(hearts ===0 ){
            stopGame();
            alert("Game Over");
        }
    }
}

function startGame() {
    if (gameStarted) {
        // If the game is already started, do nothing
        return;
    }

    gameStarted = true; // Set the flag to true


    createHeart();
    intervalId = setInterval(async () => {
        const word = await nextWord();

        const fall = setInterval(() => {
            if (!word) {
                clearInterval(fall);
                return;
            }

            const position = parseFloat(word.style.top) || 0;
            word.style.top = `${position + difficultyLevels[currentLevel].speed}px`;

            checkCollision(word);
        }, 50);
    }, difficultyLevels[currentLevel].interval);

    document.addEventListener("keydown", handleInput);

    
}

function handleInput(event) {
    const typedWord = event.key.toLowerCase();

    const words = document.querySelectorAll(".word");
    const bottomWord = words[0];

    if (typedWord === bottomWord.innerText.charAt(0)) {
        bottomWord.innerText = bottomWord.innerText.slice(1);

        if (bottomWord.innerText.length === 0) {
            bottomWord.remove();
            score += 10;
            updateScore();
        }
    } else {
        bottomWord.classList.add("typed");
        // Uncomment the line below if you want to remove a heart on incorrect input
        // removeHeart();
    }
}

function stopGame() {
    console.log('Stopping the game...');
    clearInterval(intervalId);
    document.removeEventListener("keydown", handleInput);
    document.getElementById("game-container").innerHTML = "";
    document.getElementById("hearts-container").innerHTML = "";
    gameStarted = false;
    hearts = 3;
    currentLevel = 0;

    setTimeout(() => {
        alert(`Game Over! Your score: ${score}`);
        score = 0;
        updateScore(); // Reset the score display
    }, 0);
}

updateScore();