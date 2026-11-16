// SISTEMA MULTIPLAYER COM CÓDIGO DE 4 DÍGITOS
let peer = null;
let connections = [];
let isHost = false;
let myId = "";
let remotePlayers = {};

function initNetwork() {
    // Gera um número aleatório entre 1000 e 9999
    const codigo4Digitos = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Cria o servidor com o prefixo "doblox-" + os 4 dígitos
    peer = new Peer("doblox-" + codigo4Digitos);

    peer.on('open', () => {
        myId = codigo4Digitos;
        document.getElementById("my-peer-id").innerText = codigo4Digitos;
    });

    // Se por acaso esse número já estiver a ser usado por outro jogador, tenta outro
    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            initNetwork();
        }
    });

    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
}

function setupConnection(conn) {
    connections.push(conn);

    conn.on('data', (data) => {
        if (data.type === 'move') {
            remotePlayers[data.id] = data.player;
            if (isHost) {
                broadcastData(data, conn.peer);
            }
        } else if (data.type === 'action') {
            handleRemoteAction(data);
        }
    });

    conn.on('close', () => {
        delete remotePlayers[conn.peer];
    });
}

function hostGame() {
    isHost = true;
    closeModal();
    startGame(currentSelectedGame, true);
}

function joinGame() {
    const codeInput = document.getElementById("join-id-input").value.trim();
    if (!/^\d{4}$/.test(codeInput)) {
        return alert("Mete o código de 4 dígitos do teu amigo!");
    }
    
    isHost = false;
    // Liga-se ao prefixo "doblox-" + os 4 dígitos que o teu amigo te deu
    const conn = peer.connect("doblox-" + codeInput);
    conn.on('open', () => {
        setupConnection(conn);
        closeModal();
        startGame(currentSelectedGame, false);
    });
}

function broadcastData(data, excludePeerId = null) {
    connections.forEach(conn => {
        if (conn.open && conn.peer !== excludePeerId) {
            conn.send(data);
        }
    });
}
