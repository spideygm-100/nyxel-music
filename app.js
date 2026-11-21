const tracks = [
    {
        title: "Midnight Neon",
        artist: "Nyxel Soundworks",
        desc: "Dark synthwave textures layered over deep sub-bass and cinematic atmospheres.",
        duration: 222, // 3:42
        lyrics: "Shadows stretch across the chrome,\nStatic hums inside the zone.\nPurple lights reflect the rain,\nEchoes fade into the frame."
    },
    {
        title: "Velvet Horizon",
        artist: "Aether & Kairo",
        desc: "Atmospheric downtempo percussion with analog pads and midnight resonance.",
        duration: 198, // 3:18
        lyrics: "Drifting past the city line,\nNeon signals intertwine.\nHold the frequency tonight,\nFade into the violet light."
    },
    {
        title: "Obsidian Pulse",
        artist: "Nyxel Soundworks",
        desc: "Driving cyberpunk basslines engineered for late-night focus sessions.",
        duration: 245, // 4:05
        lyrics: "Heartbeat synced to 808,\nRunning past the iron gate.\nZero noise and crystal clear,\nOnly rhythm lingers here."
    }
];

let currentTrackIndex = 0;
let isDemoLoggedIn = false;
let isPlaying = false;
let currentSeconds = 0;
let timerInterval = null;
let pendingAction = null;

// DOM Elements
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const trackDesc = document.getElementById("track-desc");
const trackArt = document.getElementById("track-art");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const progressContainer = document.getElementById("progress-container");
const progressFill = document.getElementById("progress-fill");
const playBtn = document.getElementById("play-btn");
const authStatus = document.getElementById("auth-status");

const loginModal = document.getElementById("login-modal");
const demoForm = document.getElementById("demo-login-form");
const demoUserInput = document.getElementById("demo-user");
const demoPassInput = document.getElementById("demo-pass");
const loginError = document.getElementById("login-error");
const togglePassBtn = document.getElementById("toggle-pass-btn");
const demoQuickBtn = document.getElementById("demo-quick-btn");
const cancelLoginBtn = document.getElementById("cancel-login");

const lyricsPanel = document.getElementById("lyrics-panel");
const lyricsContent = document.getElementById("lyrics-content");
const playlistPanel = document.getElementById("playlist-panel");
const playlistItems = document.getElementById("playlist-items");
const toastEl = document.getElementById("toast");

// Initialize Track & Playlist
function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    trackDesc.textContent = track.desc;
    lyricsContent.innerHTML = track.lyrics.replace(/\n/g, "<br>");
    currentSeconds = 0;
    totalTimeEl.textContent = formatTime(track.duration);
    updateProgress();
    renderPlaylist();
}

function renderPlaylist() {
    playlistItems.innerHTML = "";
    tracks.forEach((track, idx) => {
        const li = document.createElement("li");
        if (idx === currentTrackIndex) li.classList.add("active");
        li.innerHTML = `<span>${track.title}</span><span>${formatTime(track.duration)}</span>`;
        li.addEventListener("click", () => {
            loadTrack(idx);
            if (isDemoLoggedIn && !isPlaying) togglePlay();
        });
        playlistItems.appendChild(li);
    });
}

function formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
}

function updateProgress() {
    const duration = tracks[currentTrackIndex].duration;
    const pct = (currentSeconds / duration) * 100;
    progressFill.style.width = `${pct}%`;
    currentTimeEl.textContent = formatTime(currentSeconds);
}

function togglePlay() {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    trackArt.classList.toggle("playing", isPlaying);

    if (isPlaying) {
        timerInterval = setInterval(() => {
            currentSeconds++;
            if (currentSeconds >= tracks[currentTrackIndex].duration) {
                currentSeconds = 0;
                loadTrack((currentTrackIndex + 1) % tracks.length);
            }
            updateProgress();
        }, 1000);
    } else {
        clearInterval(timerInterval);
    }
}

function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    setTimeout(() => toastEl.classList.add("hidden"), 2800);
}

function openModal() {
    loginError.classList.add("hidden");
    loginModal.classList.remove("hidden");
    demoUserInput.focus();
}

function closeModal() {
    pendingAction = null;
    loginError.classList.add("hidden");
    loginModal.classList.add("hidden");
}

function completeDemoLogin(username) {
    isDemoLoggedIn = true;
    loginModal.classList.add("hidden");
    loginError.classList.add("hidden");
    authStatus.textContent = `@${username}`;
    authStatus.classList.add("authenticated");
    showToast(`Signed in as ${username}`);

    if (pendingAction) {
        executeAction(pendingAction);
        pendingAction = null;
    }
}

// Execute Protected Action After Auth
function executeAction(action) {
    switch (action) {
        case "play":
            togglePlay();
            break;
        case "download":
            showToast(`Download started: "${tracks[currentTrackIndex].title}.mp3"`);
            break;
        case "lyrics":
            playlistPanel.classList.add("hidden");
            lyricsPanel.classList.toggle("hidden");
            break;
        case "playlist":
            lyricsPanel.classList.add("hidden");
            playlistPanel.classList.toggle("hidden");
            break;
    }
}

// Gate Protected Buttons
document.querySelectorAll(".protected-action").forEach(btn => {
    btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        if (!isDemoLoggedIn) {
            pendingAction = action;
            openModal();
        } else {
            executeAction(action);
        }
    });
});

// Status Badge Click (Open Login if Guest)
authStatus.addEventListener("click", () => {
    if (!isDemoLoggedIn) {
        openModal();
    }
});

// Scrub Progress Bar
progressContainer.addEventListener("click", (e) => {
    if (!isDemoLoggedIn) {
        openModal();
        return;
    }
    const rect = progressContainer.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    currentSeconds = Math.floor(clickRatio * tracks[currentTrackIndex].duration);
    updateProgress();
});

// Track Navigation
document.getElementById("prev-btn").addEventListener("click", () => {
    const prev = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(prev);
});

document.getElementById("next-btn").addEventListener("click", () => {
    const next = (currentTrackIndex + 1) % tracks.length;
    loadTrack(next);
});

// Toggle Password Visibility
togglePassBtn.addEventListener("click", () => {
    demoPassInput.type = demoPassInput.type === "password" ? "text" : "password";
});

// Form Submit Handler
demoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = demoUserInput.value.trim();
    const password = demoPassInput.value.trim();

    if (!username || !password) {
        loginError.classList.remove("hidden");
        return;
    }

    completeDemoLogin(username);
});

// One-Click Demo Account Login
demoQuickBtn.addEventListener("click", () => {
    demoUserInput.value = "nyxel_listener";
    demoPassInput.value = "demopass123";
    completeDemoLogin("nyxel_listener");
});

// Close Modal Handlers
cancelLoginBtn.addEventListener("click", closeModal);

loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
        closeModal();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !loginModal.classList.contains("hidden")) {
        closeModal();
    }
});

// Initialize
loadTrack(0);
