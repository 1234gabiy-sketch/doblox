// MOTOR DOS JOGOS 2D TOP-DOWN
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameLoopId = null;
let activeGameMode = "";
let keys = {};

let localPlayer = {
    x: 100, y: 100, size: 25,
    color: "#00a2ff",
    name: "Jogador",
    role: "Inocente", // Inocente, Assassino, Xerife, Sobrevivente
    alive: true
};

// Variáveis específicas do POORS!DO
let poorsDoor = { x: 720, y: 220, w: 40, h: 60, number: 1 };
let poorsMonster = { x: -100, y: 250, active: false, speed: 9 };

// Variáveis específicas do Homicide Distery 2
let bullets = [];

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space" && activeGameMode) triggerGameAction();
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function startGame(mode, hostStatus) {
    activeGameMode = mode;
    document.getElementById("lobby-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");

    localPlayer.x = 100;
    localPlayer.y = 250;
    localPlayer.alive = true;
    localPlayer.color = DuauEngine.playerColor;
    localPlayer.name = currentUser;
    bullets = [];

    if (mode === "hd2") {
        document.getElementById("hud-game-name").innerText = "Homicide Distery 2";
        // Se for host é Assassino, se entrar depois é Xerife (para dar porrada logo)
        localPlayer.role = hostStatus ? "Assassino 🔪" : "Xerife 🔫";
    } else if (mode === "poors") {
        document.getElementById("hud-game-name").innerText = "POORS!DO";
        localPlayer.role = "Explorador 🔦";
        poorsDoor.number = 1;
        poorsMonster.active = false;
    } else if (mode === "studio") {
        document.getElementById("hud-game-name").innerText = "Mapa do Doblox Studio";
        localPlayer.role = "Criador 🛠️";
    }

    updateHUD();
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoop();
}

function updateHUD() {
    document.getElementById("hud-role").innerText = `Papel: ${localPlayer.role}`;
    document.getElementById("hud-status").innerText = localPlayer.alive ? "Estado: Vivo 😎" : "Estado: Foste de Vasco 💀";
}

function triggerGameAction() {
    if (!localPlayer.alive) return;

    if (activeGameMode === "hd2") {
        if (localPlayer.role.includes("Xerife")) {
            // Dispara bala para a direita
            bullets.push({ x: localPlayer.x + 20, y: localPlayer.y + 10, vx: 10 });
            broadcastData({ type: 'action', action: 'shoot', x: localPlayer.x, y: localPlayer.y });
        } else if (localPlayer.role.includes("Assassino")) {
            // Ataque de faca curto alcance
            broadcastData({ type: 'action', action: 'slash', x: localPlayer.x, y: localPlayer.y });
            checkKnifeKill(localPlayer.x, localPlayer.y);
        }
    }
}

function handleRemoteAction(data) {
    if (data.action === 'shoot') {
        bullets.push({ x: data.x + 20, y: data.y + 10, vx: 10 });
    } else if (data.action === 'slash') {
        checkKnifeKill(data.x, data.y);
    }
}

function checkKnifeKill(kx, ky) {
    const dist = Math.hypot(localPlayer.x - kx, localPlayer.y - ky);
    if (dist < 50 && !localPlayer.role.includes("Assassino")) {
        localPlayer.alive = false;
        updateHUD();
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Movimento do jogador
    if (localPlayer.alive) {
        let spd = DuauEngine.playerSpeed;
        if (keys["w"] || keys["arrowup"]) localPlayer.y -= spd;
        if (keys["s"] || keys["arrowdown"]) localPlayer.y += spd;
        if (keys["a"] || keys["arrowleft"]) localPlayer.x -= spd;
        if (keys["d"] || keys["arrowright"]) localPlayer.x += spd;

        // Limites do ecrã
        localPlayer.x = Math.max(0, Math.min(canvas.width - localPlayer.size, localPlayer.x));
        localPlayer.y = Math.max(0, Math.min(canvas.height - localPlayer.size, localPlayer.y));

        // Envia posição pela rede
        broadcastData({ type: 'move', id: myId, player: localPlayer });
    }

    // LÓGICA ESPECÍFICA DE CADA JOGO
    if (activeGameMode === "poors") {
        // Desenha escuridão e porta
        ctx.fillStyle = "#0a0a0c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Porta
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(poorsDoor.x, poorsDoor.y, poorsDoor.w, poorsDoor.h);
        ctx.fillStyle = "#fff";
        ctx.fillText(`Porta ${poorsDoor.number}`, poorsDoor.x - 5, poorsDoor.y - 10);

        // Chegou à porta?
        if (Math.hypot(localPlayer.x - poorsDoor.x, localPlayer.y - poorsDoor.y) < 45) {
            poorsDoor.number++;
            localPlayer.x = 50;
            addDobux(10);
            // 30% de chance de vir o bicho (Rush)
            if (Math.random() < 0.35) {
                poorsMonster.active = true;
                poorsMonster.x = 850;
                poorsMonster.y = localPlayer.y;
            }
        }

        // Monstro Rush
        if (poorsMonster.active) {
            poorsMonster.x -= poorsMonster.speed;
            ctx.fillStyle = "#ff0000";
            ctx.beginPath();
            ctx.arc(poorsMonster.x, poorsMonster.y, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText("RUSH 💀", poorsMonster.x - 20, poorsMonster.y);

            if (Math.hypot(localPlayer.x - poorsMonster.x, localPlayer.y - poorsMonster.y) < 40) {
                localPlayer.alive = false;
                updateHUD();
            }
            if (poorsMonster.x < -50) poorsMonster.active = false;
        }
    } 
    else if (activeGameMode === "hd2") {
        // Mapa simples do MM2
        ctx.fillStyle = "#3a3f47";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Balas do Xerife
        ctx.fillStyle = "yellow";
        bullets.forEach((b, i) => {
            b.x += b.vx;
            ctx.fillRect(b.x, b.y, 10, 5);
            if (Math.hypot(localPlayer.x - b.x, localPlayer.y - b.y) < 25 && localPlayer.role.includes("Assassino")) {
                localPlayer.alive = false;
                updateHUD();
            }
        });
    }
    else if (activeGameMode === "studio") {
        // Desenha blocos criados no Studio com DUAU
        DuauEngine.customBlocks.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
        });
    }

    // Desenhar jogadores remotos (Multiplayer)
    for (let id in remotePlayers) {
        let p = remotePlayers[id];
        if (p.alive) drawCharacter(p);
    }

    // Desenhar o jogador local
    if (localPlayer.alive) drawCharacter(localPlayer);

    gameLoopId = requestAnimationFrame(gameLoop);
}

function drawCharacter(p) {
    // Cabeça amarela clássica de Noob + Tronco colorido
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(p.x, p.y, p.size, p.size);

    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText(p.name, p.x - 5, p.y - 8);
}
