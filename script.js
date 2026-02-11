const playground = document.getElementById("playground");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const timeBarEl = document.getElementById("timeBar");
const difficultyLabelEl = document.getElementById("difficultyLabel");
const difficultySelect = document.getElementById("difficultySelect");
const soundToggle = document.getElementById("soundToggle");
const startBtn = document.getElementById("startBtn");
const hintEl = document.getElementById("hint");

const GAME_DURATION = 45;

const DIFFICULTY = {
  easy: { label: "Kolay", spawnMs: 900, speedMin: 6.8, speedMax: 9.8, maxBubbles: 16 },
  normal: { label: "Normal", spawnMs: 650, speedMin: 5.2, speedMax: 8.2, maxBubbles: 22 },
  hard: { label: "Zor", spawnMs: 460, speedMin: 4.2, speedMax: 6.8, maxBubbles: 30 }
};

let score = 0;
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
  timeEl.textContent = String(timeLeft);
  difficultyLabelEl.textContent = currentMode.label;

  const ratio = Math.max(0, Math.min(1, timeLeft / GAME_DURATION));
  timeBarEl.style.width = `${ratio * 100}%`;
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

  const activeBubbles = playground.querySelectorAll(".bubble").length;
  if (activeBubbles >= currentMode.maxBubbles) return;

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
  bubble.addEventListener("mouseenter", pop, { once: true });
  bubble.addEventListener("pointerdown", pop, { once: true });

  bubble.addEventListener(
    "animationend",
    () => {
      if (!gameRunning || !playground.contains(bubble)) return;
      bubble.classList.add("waiting");
    },
    { once: true }
  );

  playground.appendChild(bubble);
}

function popBubble(bubble) {
  if (!gameRunning || !playground.contains(bubble)) return;

  score += 1;
  updateHud();
  playPopSound();

  bubble.classList.remove("waiting");
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

  startBtn.disabled = false;
  difficultySelect.disabled = false;
  startBtn.textContent = `Tekrar Oyna (Skor: ${score})`;

  hintEl.textContent = `${reason} | Son skor: ${score}`;
  hintEl.classList.add("game-over");
}

function startGame() {
  currentMode = DIFFICULTY[difficultySelect.value] ?? DIFFICULTY.normal;

  score = 0;
  timeLeft = GAME_DURATION;
  gameRunning = true;

  updateHud();
  clearBubbles();

  hintEl.textContent = "Baloncuklar yukarı çıkar ve patlatana kadar kalır. Üzerine gel veya dokun, hemen patlasın.";
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
});

startBtn.addEventListener("click", startGame);
updateHud();
