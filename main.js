// GESTOR PRINCIPAL DO DOBLOX
let currentUser = "";
let dobux = 9999;
let currentSelectedGame = "";

// Verifica se já fez login antes
window.onload = () => {
    const savedUser = localStorage.getItem("doblox_user");
    const savedDobux = localStorage.getItem("doblox_dobux");
    if (savedUser) {
        currentUser = savedUser;
        if (savedDobux) dobux = parseInt(savedDobux);
        showLobby();
    }
    initNetwork();
    setupStudioCanvas();
};

function login() {
    const user = document.getElementById("username-input").value.trim();
    const pass = document.getElementById("password-input").value.trim();
    const errorEl = document.getElementById("login-error");

    if (user.length < 3) {
        errorEl.innerText = "O nick tem de ter pelo menos 3 letras, ó preguiçoso!";
        return;
    }
    if (pass.length < 1) {
        errorEl.innerText = "Mete uma senha qualquer!";
        return;
    }

    currentUser = user;
    localStorage.setItem("doblox_user", currentUser);
    localStorage.setItem("doblox_dobux", dobux);
    showLobby();
}

function logout() {
    localStorage.removeItem("doblox_user");
    location.reload();
}

function showLobby() {
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("lobby-screen").classList.add("active");
    document.getElementById("display-user").innerText = currentUser;
    document.getElementById("dobux-count").innerText = dobux;
}

function addDobux(amount) {
    dobux += amount;
    localStorage.setItem("doblox_dobux", dobux);
    document.getElementById("dobux-count").innerText = dobux;
}

function selectGame(gameCode) {
    currentSelectedGame = gameCode;
    document.getElementById("selected-game-title").innerText = 
        gameCode === "hd2" ? "Homicide Distery 2" : "POORS!DO";
    document.getElementById("multiplayer-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("multiplayer-modal").classList.add("hidden");
}

function leaveGame() {
    activeGameMode = "";
    cancelAnimationFrame(gameLoopId);
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("lobby-screen").classList.add("active");
}

// FUNÇÕES DO DOBLOX STUDIO
function openStudio() {
    document.getElementById("lobby-screen").classList.remove("active");
    document.getElementById("studio-screen").classList.add("active");
    drawStudioMap();
}

function closeStudio() {
    document.getElementById("studio-screen").classList.remove("active");
    document.getElementById("lobby-screen").classList.add("active");
}

function setupStudioCanvas() {
    const sCanvas = document.getElementById("studioCanvas");
    sCanvas.addEventListener("click", (e) => {
        const rect = sCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 20) * 20;
        const y = Math.floor((e.clientY - rect.top) / 20) * 20;
        DuauEngine.customBlocks.push({ x, y, w: 40, h: 40, color: "#00a2ff" });
        drawStudioMap();
    });
}

function drawStudioMap() {
    const sCanvas = document.getElementById("studioCanvas");
    const sCtx = sCanvas.getContext("2d");
    sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);

    DuauEngine.customBlocks.forEach(b => {
        sCtx.fillStyle = b.color;
        sCtx.fillRect(b.x, b.y, b.w, b.h);
    });
}

function clearStudioMap() {
    DuauEngine.customBlocks = [];
    drawStudioMap();
}

function runDuauCode() {
    const code = document.getElementById("duau-editor").value;
    DuauEngine.execute(code);
}

function testCustomMap() {
    document.getElementById("studio-screen").classList.remove("active");
    startGame("studio", true);
}
