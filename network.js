// SISTEMA MULTIPLAYER P2P PARA GITHUB PAGES
let peer = null;
let connections = [];
let isHost = false;
let myId = "";
let remotePlayers = {}; // Guarda os outros jogadores

function initNetwork() {
    peer = new Peer(); // Gera ID automático gratuito

    peer.on('open', (id) => {
        myId = id;
        document.getElementById("my-peer-id").innerText = id;
    });

    // Quando alguém se liga a ti (se fores o Host)
    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
}

function setupConnection(conn) {
    connections.push(conn);

    conn.on('data', (data) => {
        if (data.type === 'move') {
            remotePlayers[data.id] = data.player;
            // Se sou o Host, reencaminho para os outros todos
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
    const hostId = document.getElementById("join-id-input").value.trim();
    if (!hostId) return alert("Mete o ID do teu amigo primeiro, ó esperto!");
    
    isHost = false;
    const conn = peer.connect(hostId);
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
