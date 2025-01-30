const character = document.getElementById("character");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("game-over");
const restartButton = document.getElementById("restart-button");
const startButton = document.getElementById("start-button");
const gameContainer = document.getElementById("game-container");
const distanceElement = document.getElementById("distance");
const instructions = document.getElementById("instructions");
const walletAddressInput = document.getElementById("wallet-address");
const saveWalletButton = document.getElementById("save-wallet");
const leaderboardList = document.getElementById("leaderboard-list");

let distance = 0;
let characterTop = 250;
let characterLeft = 50;
const gravity = 2;
let gameSpeed = 2.5; // Startgeschwindigkeit
let isGameOver = false;
let score = 0;
const jumpForce = -50;
let baconCount = 0;

let lastTime = 0;
const frameRate = 60; // Ziel-Framerate
const frameDelay = 1000 / frameRate;




document.addEventListener("keydown", jump);
restartButton.addEventListener("click", restartGame);
startButton.addEventListener("click", startGame);

function jump(event) {
    if (event.code === "Space" && !isGameOver) {
        characterTop += jumpForce;
        createParticles(characterLeft + 20, characterTop + 50);
        playSound("jump.mp3");
    }
}

function startGame() {
    startButton.style.display = "none";
    instructions.style.display = "none";
    gameLoop();
}

function gameLoop(timestamp) {
    if (!isGameOver) {
        if (timestamp - lastTime >= frameDelay) {
            updateDistance();
            updateCharacterPosition();
            checkGameOver();
            movePipes();
            moveBacons();
            lastTime = timestamp;
        }
        requestAnimationFrame(gameLoop);
    }
}

function updateCharacterPosition() {
    characterTop += gravity;
    character.style.top = `${characterTop}px`;
}

function checkGameOver() {
    if (characterTop <= 0 || characterTop >= 540) {
        gameOver();
    }
}

function movePipes() {
    const pipes = document.querySelectorAll(".pipe");
    pipes.forEach(pipe => {
        const pipeLeft = parseInt(pipe.style.left);

        if (pipeLeft > -60) {
            pipe.style.left = `${pipeLeft - gameSpeed}px`;
            if (checkCollision(character, pipe)) {
                gameOver();
            }
            if (pipeLeft === 50) {
                // updateScore();
            }
        } else {
            resetPipe(pipe);
        }
    });
}

function updateDistance() {
    distance += gameSpeed / 50;
    distanceElement.textContent = `Distance: ${Math.floor(distance)} m`;

    // Erhöhe die Spielgeschwindigkeit alle 100 Meter
    if (distance % 100 === 0) {
        gameSpeed += 0.5;
    }
}

function updateScore() {
    score = score + 1;
    scoreElement.textContent = `Haram: ${score}`;
}

function resetPipe(pipe) {
    pipe.style.left = "400px";
    if (pipe.classList.contains("top")) {
        pipe.style.height = `${Math.floor(Math.random() * 200 + 100)}px`;
    } else if (pipe.classList.contains("bottom")) {
        const topPipeHeight = parseInt(document.querySelector(".pipe.top").style.height);
        const gap = Math.floor(Math.random() * PIPE_GAP_RANGE + PIPE_GAP_MIN);
        const bottomPipeHeight = GAME_HEIGHT - topPipeHeight - gap;

        // Sicherstellen, dass die untere Pipe den Boden berührt
        pipe.style.height = `${bottomPipeHeight}px`;
        pipe.style.top = `${topPipeHeight + gap}px`;
    }
}

function moveBacons() {
    const bacons = document.querySelectorAll(".bacon");
    bacons.forEach(bacon => {
        const baconLeft = parseInt(bacon.style.left);
        if (baconLeft > -30) {
            bacon.style.left = `${baconLeft - gameSpeed}px`;
            if (checkCollision(character, bacon)) {
                collectBacon(bacon);
            }
        } else {
            resetBacon(bacon);
        }
    });
}

function collectBacon(bacon) {
    bacon.remove();
    baconCount++;
    playSound("collect.mp3");
    createParticles(parseInt(bacon.style.left) + 15, parseInt(bacon.style.top) + 15);
    updateScore();//score updates on bacon collection
}

function resetBacon(bacon) {
    bacon.style.left = "400px";
    bacon.style.top = `${Math.floor(Math.random() * 500)}px`;

    // Überprüfen, ob der Bacon in einer Röhre spawnen würde
    const pipes = document.querySelectorAll(".pipe");
    let isColliding = false;
    pipes.forEach(pipe => {
        if (checkCollision(bacon, pipe)) {
            isColliding = true;
        }
    });

    if (isColliding) {
        resetBacon(bacon); // Bacon erneut spawnen, wenn er in einer Röhre ist
    }
}

function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
        rect1.top + 10 > rect2.bottom - 10 ||
        rect1.bottom - 10 < rect2.top + 10 ||
        rect1.left + 10 > rect2.right - 10 ||
        rect1.right - 10 < rect2.left + 10
    );
}

function gameOver() {
    if (!isGameOver) {
        isGameOver = true;
        gameOverElement.style.display = "block";
        restartButton.style.display = "block";
        createParticles(characterLeft + 30, characterTop + 30);
        playSound("gameover.mp3");
        saveScore(score); // Score speichern
    }
}

function restartGame() {
    isGameOver = false;
    gameOverElement.style.display = "none";
    restartButton.style.display = "none";
    characterTop = 250;
    character.style.top = `${characterTop}px`;
    score = 0;
    distance = 0;
    baconCount = 0;
    gameSpeed = 2; // Reset der Spielgeschwindigkeit
    scoreElement.textContent = `Haram: ${score}`;
    document.querySelectorAll(".pipe, .bacon").forEach(element => element.remove());
    generatePipes();
    generateBacons();
    gameLoop();
}

const PIPE_GAP_MIN = 150; // Lücke verkleinert
const PIPE_GAP_RANGE = 100; // Lücke verkleinert
const PIPE_HEIGHT_MIN = 100;
const PIPE_HEIGHT_RANGE = 200;
const PIPE_START_LEFT = 400;
const PIPE_SPACING = 200;
const GAME_HEIGHT = 700;

function generatePipes() {
    let pipeCount = 2 + Math.floor(distance / 100); // Erhöhe die Anzahl der Röhren alle 100 Meter

    for (let i = 0; i < pipeCount; i++) {
        const gap = Math.floor(Math.random() * PIPE_GAP_RANGE + PIPE_GAP_MIN);
        const topPipeHeight = Math.floor(Math.random() * PIPE_HEIGHT_RANGE + PIPE_HEIGHT_MIN);
        const bottomPipeHeight = GAME_HEIGHT - topPipeHeight - gap;

        if (bottomPipeHeight < PIPE_HEIGHT_MIN) {
            const adjustedGap = GAME_HEIGHT - topPipeHeight - PIPE_HEIGHT_MIN;
            createPipe("top", topPipeHeight, 0, PIPE_START_LEFT + i * PIPE_SPACING);
            createPipe("bottom", PIPE_HEIGHT_MIN, topPipeHeight + adjustedGap, PIPE_START_LEFT + i * PIPE_SPACING);
        } else {
            createPipe("top", topPipeHeight, 0, PIPE_START_LEFT + i * PIPE_SPACING);
            createPipe("bottom", bottomPipeHeight, topPipeHeight + gap, PIPE_START_LEFT + i * PIPE_SPACING);
        }
    }
}

function createPipe(className, height, top, left) {
    //two cases green or normal
    let classPipeBottom = "pipe";
    let classPipeTop = "pipehead";

    random  = Math.floor(Math.random() * 2);
    console.log(random);
    switch(random){
        case 0: //default case
            break;
        case 1:
            classPipeBottom = classPipeBottom + " pipe-green";
            classPipeTop = classPipeTop + " pipehead-green";
            break;
    }
    const pipe = document.createElement("div");
    pipe.className = `${classPipeBottom} ${className}`;
    pipe.style.height = `${height}px`;
    pipe.style.top = `${top}px`;
    pipe.style.left = `${left}px`;
    gameContainer.appendChild(pipe);
    //append pipehead to pipe
    const pipeHead = document.createElement("div");
    pipeHead.className = classPipeTop;
    pipe.appendChild(pipeHead);
}


function generateBacons() {
    for (let i = 0; i < 3; i++) {
        const bacon = document.createElement("div");
        bacon.className = "bacon";
        bacon.style.top = `${Math.floor(Math.random() * 500)}px`;
        bacon.style.left = `${400 + i * 150}px`;
        gameContainer.appendChild(bacon);
    }
}

function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        gameContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.volume = 0.5; // Lautstärke anpassen
    audio.play();
}

generatePipes();
generateBacons();
updateLeaderboard();