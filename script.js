const playground = document.getElementById("playground");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");

const GAME_DURATION = 30;
const SPAWN_MS = 550;

let score = 0;
let timeLeft = GAME_DURATION;
let gameRunning = false;
let spawnTimer = null;
let countdownTimer = null;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubble() {
  if (!gameRunning) return;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const size = random(35, 85);
  const left = random(8, 92);
  const duration = random(3.5, 8.5);
  const hue = Math.floor(random(0, 360));

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${left}%`;
  bubble.style.top = "110%";
  bubble.style.animationDuration = `${duration}s`;
  bubble.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue} 100% 82%), hsl(${(hue + 50) % 360} 80% 45%))`;

  const pop = () => popBubble(bubble);

  // Tıklamadan: fare balonun üstüne geldiği anda patlar.
  bubble.addEventListener("mouseenter", pop, { once: true });

  bubble.addEventListener("animationend", () => {
    bubble.remove();
  });

  playground.appendChild(bubble);
}

function popBubble(bubble) {
  if (!gameRunning || !playground.contains(bubble)) return;

  score += 1;
  scoreEl.textContent = String(score);

  bubble.classList.add("pop");
  setTimeout(() => bubble.remove(), 180);
}

function clearBubbles() {
  playground.querySelectorAll(".bubble").forEach((b) => b.remove());
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  startBtn.disabled = false;
  startBtn.textContent = `Tekrar Oyna (Skor: ${score})`;
}

function startGame() {
  score = 0;
  timeLeft = GAME_DURATION;
  gameRunning = true;

  scoreEl.textContent = "0";
  timeEl.textContent = String(timeLeft);
  clearBubbles();

  startBtn.disabled = true;
  startBtn.textContent = "Oyun Devam Ediyor...";

  spawnTimer = setInterval(createBubble, SPAWN_MS);

  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

startBtn.addEventListener("click", startGame);
