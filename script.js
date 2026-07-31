/* =========================================================
   CONFIG — easy customization zone
   ========================================================= */
   /* =========================================================
   EMAILJS INIT — 🔑 ใส่ Public Key ของคุณตรงนี้
   ========================================================= */
emailjs.init("sSHRrhMHRZf7W66WC");
const CONFIG = {
  // 💬 YES button text sequence (changes every time "ไม่" is clicked)
  yesTexts: [
    "ตกลง 💕",
    "แน่ใจนะ ❤️",
    "ได้โปรด 🥺",
    "รักเค้าน้า 💖",
    "เป็นแฟนกันนะ 💍"
  ],
  // 📈 How much the YES button grows per "ไม่" click (in em, applied to font-size)
  growthStepRem: 0.35,
  startFontRem: 1,
  maxFontRem: 3.2,
  // 💗 Floating hearts settings
  heartEmojis: ["💗", "💖", "💕", "💓", "💞", "🌸"],
  sparkleEmojis: ["✨", "⭐", "🌟"],
  heartSpawnIntervalMs: 550,
  sparkleSpawnIntervalMs: 900,
};

/* =========================================================
   SECTION / PAGE NAVIGATION
   ========================================================= */
const pages = document.querySelectorAll(".page");

function goToPage(pageNumber) {
  const current = document.querySelector(".page.active");
  const next = document.getElementById(`page${pageNumber}`);
  if (!next || next === current) return;

  if (current) {
    current.classList.add("fade-out");
    current.classList.remove("active");
    setTimeout(() => current.classList.remove("fade-out"), 400);
  }

  // Small delay lets the fade-out start before the new page fades in
  setTimeout(() => {
    next.classList.add("active");
  }, 120);
}

document.querySelectorAll(".next-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-next");
    goToPage(target);
  });
});

/* =========================================================
   FLOATING HEARTS + SPARKLES (continuous ambient background)
   ========================================================= */
const heartsLayer = document.getElementById("heartsLayer");
const sparklesLayer = document.getElementById("sparklesLayer");

function spawnHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = CONFIG.heartEmojis[Math.floor(Math.random() * CONFIG.heartEmojis.length)];

  const startX = Math.random() * 100; // vw
  const duration = 6 + Math.random() * 6; // seconds
  const size = 1 + Math.random() * 1.6; // rem

  heart.style.left = `${startX}vw`;
  heart.style.animationDuration = `${duration}s`;
  heart.style.fontSize = `${size}rem`;

  heartsLayer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 200);
}

function spawnSparkle() {
  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.textContent = CONFIG.sparkleEmojis[Math.floor(Math.random() * CONFIG.sparkleEmojis.length)];

  sparkle.style.left = `${Math.random() * 100}vw`;
  sparkle.style.top = `${Math.random() * 100}vh`;
  sparkle.style.animationDuration = `${1.6 + Math.random() * 1.6}s`;

  sparklesLayer.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 3200);
}

setInterval(spawnHeart, CONFIG.heartSpawnIntervalMs);
setInterval(spawnSparkle, CONFIG.sparkleSpawnIntervalMs);
// Spawn a first small burst immediately so the screen isn't empty on load
for (let i = 0; i < 8; i++) setTimeout(spawnHeart, i * 150);
for (let i = 0; i < 6; i++) setTimeout(spawnSparkle, i * 200);

/* =========================================================
   BACKGROUND MUSIC — plays continuously, never restarts
   ========================================================= */
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = document.getElementById("musicIcon");
let musicStarted = false;

function playMusic() {
  bgMusic.volume = 0.5;
  bgMusic.play().then(() => {
    musicStarted = true;
    musicIcon.textContent = "🔊";
  }).catch(() => {
    // Autoplay blocked by browser — will start on first user interaction
    musicIcon.textContent = "🔇";
  });
}

musicToggle.addEventListener("click", () => {
  if (bgMusic.paused) {
    playMusic();
  } else {
    bgMusic.pause();
    musicIcon.textContent = "🔇";
  }
});

// Try to start music on the very first user interaction anywhere on the page
// (covers browsers that block autoplay until interaction)
document.addEventListener("click", function startOnFirstClick() {
  if (!musicStarted) playMusic();
  document.removeEventListener("click", startOnFirstClick);
}, { once: true });

/* =========================================================
   "ไม่" (NO) BUTTON — grows the YES button, cycles its text
   ========================================================= */
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
let noClickCount = 0;

noBtn.addEventListener("click", () => {
  noClickCount++;

  // Cycle YES button text (clamped to the last available text)
  const textIndex = Math.min(noClickCount, CONFIG.yesTexts.length - 1);
  yesBtn.textContent = CONFIG.yesTexts[textIndex];

  // Grow YES button smoothly
  const newSize = Math.min(
    CONFIG.startFontRem + noClickCount * CONFIG.growthStepRem,
    CONFIG.maxFontRem
  );
  yesBtn.style.fontSize = `${newSize}rem`;
  yesBtn.style.padding = `${14 + noClickCount * 4}px ${32 + noClickCount * 10}px`;

  // Shrink & fade the NO button so it becomes harder to hit
  const noScale = Math.max(1 - noClickCount * 0.12, 0.35);
  const noOpacity = Math.max(1 - noClickCount * 0.1, 0.4);
  noBtn.style.transform = `scale(${noScale})`;
  noBtn.style.opacity = `${noOpacity}`;

  // Nudge NO button to a random nearby spot after a few clicks (playful, not impossible)
  if (noClickCount >= 3) {
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 20;
    noBtn.style.transform += ` translate(${offsetX}px, ${offsetY}px)`;
  }
});

/* =========================================================
   "ตกลง" (YES) BUTTON — show modal + confetti
   ========================================================= */
const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");

yesBtn.addEventListener("click", () => {
  modalOverlay.classList.add("open");
  fireConfetti();

  // 📧 ส่งอีเมลแจ้งเมื่อกดตกลง
  emailjs.send("service_7oisamm", "template_xdg0b9n", {
    message: "เธอกดตกลงแล้วนะ! 💖"
  }).then(() => {
    console.log("ส่งอีเมลสำเร็จ");
  }).catch((err) => {
    console.error("ส่งอีเมลไม่สำเร็จ:", err);
  });
});

closeModalBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("open");
});

// Close modal when clicking outside the box
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("open");
  }
});

/* =========================================================
   CONFETTI EXPLOSION (Canvas Confetti CDN)
   ========================================================= */
function fireConfetti() {
  if (typeof confetti !== "function") return;

  const colors = ["#ff86b3", "#ffc9de", "#ffa6c9", "#e9d5ff", "#fff5f9"];

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
  });

  // Extra bursts from the sides for a fuller celebration
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors });
  }, 250);
}
