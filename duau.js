// INTERPRETADOR DA LINGUAGEM DUAU (Criada nas caves da Tuga)
const DuauEngine = {
    customBlocks: [],
    playerColor: "#00a2ff",
    playerSpeed: 4,

    log: function(msg) {
        const consoleBox = document.getElementById("duau-console");
        consoleBox.innerHTML += `<div>> ${msg}</div>`;
        consoleBox.scrollTop = consoleBox.scrollHeight;
    },

    execute: function(code) {
        document.getElementById("duau-console").innerHTML = "";
        this.log("A compilar código DUAU...");
        
        const lines = code.split("\n");
        
        lines.forEach((line, index) => {
            line = line.trim();
            if (!line || line.startsWith("--")) return; // Ignora comentários

            try {
                // Comando: falar("texto")
                if (line.startsWith("falar(") && line.endsWith(")")) {
                    const text = line.slice(6, -1).replace(/['"]/g, "");
                    this.log(`[DUAU DIZ]: ${text}`);
                }
                // Comando: cor_jogador("#hex")
                else if (line.startsWith("cor_jogador(") && line.endsWith(")")) {
                    const color = line.slice(12, -1).replace(/['"]/g, "");
                    this.playerColor = color;
                    this.log(`Cor do boneco alterada para ${color}`);
                }
                // Comando: velocidade(numero)
                else if (line.startsWith("velocidade(") && line.endsWith(")")) {
                    const speed = parseFloat(line.slice(11, -1));
                    if (!isNaN(speed)) {
                        this.playerSpeed = speed;
                        this.log(`Velocidade definida para ${speed}`);
                    }
                }
                // Comando: criar_bloco(x, y, "cor")
                else if (line.startsWith("criar_bloco(") && line.endsWith(")")) {
                    const args = line.slice(12, -1).split(",");
                    const x = parseInt(args[0]);
                    const y = parseInt(args[1]);
                    const color = args[2] ? args[2].trim().replace(/['"]/g, "") : "gray";
                    this.customBlocks.push({ x, y, w: 40, h: 40, color });
                    drawStudioMap();
                    this.log(`Bloco criado em X:${x}, Y:${y}`);
                }
                // Comando: dar_dobux(quantidade)
                else if (line.startsWith("dar_dobux(") && line.endsWith(")")) {
                    const amount = parseInt(line.slice(10, -1));
                    if (!isNaN(amount)) {
                        addDobux(amount);
                        this.log(`HACK ATIVADO: +${amount} Dobux na conta!`);
                    }
                }
                else {
                    this.log(`<span style="color:red">Erro na linha ${index + 1}: O que raio é "${line}"?</span>`);
                }
            } catch (e) {
                this.log(`<span style="color:red">Erro fatal na linha ${index + 1}</span>`);
            }
        });
    }
};
