const playground = document.getElementById("playground");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const livesEl = document.getElementById("lives");
const difficultyLabelEl = document.getElementById("difficultyLabel");
const difficultySelect = document.getElementById("difficultySelect");
const soundToggle = document.getElementById("soundToggle");
const startBtn = document.getElementById("startBtn");
const hintEl = document.getElementById("hint");

const GAME_DURATION = 30;

const DIFFICULTY = {
  easy: { label: "Kolay", spawnMs: 750, speedMin: 5.5, speedMax: 9, lives: 6 },
  normal: { label: "Normal", spawnMs: 550, speedMin: 4.2, speedMax: 7.2, lives: 5 },
  hard: { label: "Zor", spawnMs: 380, speedMin: 3.2, speedMax: 5.8, lives: 3 }
};

let score = 0;
let lives = 5;
let timeLeft = GAME_DURATION;
let gameRunning = false;
let spawnTimer = null;
let countdownTimer = null;
let currentMode = DIFFICULTY.normal;
let audioContext = null;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function updateHud() {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
  timeEl.textContent = String(timeLeft);
  difficultyLabelEl.textContent = currentMode.label;
}

function playPopSound() {
  if (!soundToggle.checked) return;

  if (!audioContext) {
    audioContext = new window.AudioContext();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = random(380, 680);

  gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

function createBubble() {
  if (!gameRunning) return;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const size = random(35, 85);
  const left = random(8, 92);
  const duration = random(currentMode.speedMin, currentMode.speedMax);
  const hue = Math.floor(random(0, 360));

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${left}%`;
  bubble.style.top = "110%";
  bubble.style.animationDuration = `${duration}s`;
  bubble.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue} 100% 82%), hsl(${(hue + 50) % 360} 80% 45%))`;

  const pop = () => popBubble(bubble);

  // Tıklamadan: mouse üzerine gelince patlar.
  bubble.addEventListener("mouseenter", pop, { once: true });
  // Mobil destek: dokununca patlar.
  bubble.addEventListener("pointerdown", pop, { once: true });

  bubble.addEventListener("animationend", () => {
    if (!gameRunning || !playground.contains(bubble)) return;

    bubble.remove();
    lives -= 1;
    updateHud();

    if (lives <= 0) {
      endGame("Can bitti 😵");
    }
  });

  playground.appendChild(bubble);
}

function popBubble(bubble) {
  if (!gameRunning || !playground.contains(bubble)) return;

  score += 1;
  updateHud();
  playPopSound();

  bubble.classList.add("pop");
  setTimeout(() => bubble.remove(), 180);
}

function clearBubbles() {
  playground.querySelectorAll(".bubble").forEach((b) => b.remove());
}

function endGame(reason = "Süre bitti ⏰") {
  gameRunning = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  clearBubbles();

  startBtn.disabled = false;
  difficultySelect.disabled = false;
  startBtn.textContent = `Tekrar Oyna (Skor: ${score})`;

  hintEl.textContent = `${reason} | Son skor: ${score}`;
  hintEl.classList.add("game-over");
}

function startGame() {
  currentMode = DIFFICULTY[difficultySelect.value] ?? DIFFICULTY.normal;

  score = 0;
  lives = currentMode.lives;
  timeLeft = GAME_DURATION;
  gameRunning = true;

  updateHud();
  clearBubbles();

  hintEl.textContent = "İpucu: Baloncuklara tıklamadan, mouse veya dokunma ile değdirerek patlat.";
  hintEl.classList.remove("game-over");

  startBtn.disabled = true;
  difficultySelect.disabled = true;
  startBtn.textContent = "Oyun Devam Ediyor...";

  createBubble();
  spawnTimer = setInterval(createBubble, currentMode.spawnMs);

  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    updateHud();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

difficultySelect.addEventListener("change", () => {
  const mode = DIFFICULTY[difficultySelect.value] ?? DIFFICULTY.normal;
  difficultyLabelEl.textContent = mode.label;
  livesEl.textContent = String(mode.lives);
});

startBtn.addEventListener("click", startGame);
updateHud();
