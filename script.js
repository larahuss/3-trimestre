// ==========================================
// 1. NAVEGAÇÃO E ACESSIBILIDADE
// ==========================================
function abrirAba(idAba, botao) {
  document.querySelectorAll('.secao').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(idAba).classList.add('active');
  botao.classList.add('active');
}

let tamanhoFonteAtual = 18;
function alterarFonte(delta) {
  tamanhoFonteAtual = Math.min(26, Math.max(14, tamanhoFonteAtual + delta));
  document.documentElement.style.setProperty('--font-size-base', tamanhoFonteAtual + 'px');
}

function alternarContraste() {
  document.body.classList.toggle('alto-contraste');
}

// ==========================================
// 2. SIMULADOR DE MATRIZ DE LEDS 8x8
// ==========================================
const padroesMatriz = {
  feliz: [
    0,0,1,1,1,1,0,0,
    0,1,0,0,0,0,1,0,
    1,0,1,0,0,1,0,1,
    1,0,0,0,0,0,0,1,
    1,0,1,0,0,1,0,1,
    1,0,0,1,1,0,0,1,
    0,1,0,0,0,0,1,0,
    0,0,1,1,1,1,0,0
  ],
  alerta: [
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,0,0,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0
  ],
  seta: [
    0,0,0,0,1,0,0,0,
    0,0,0,0,0,1,0,0,
    0,0,0,0,0,0,1,0,
    1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,1,0,
    0,0,0,0,0,1,0,0,
    0,0,0,0,1,0,0,0
  ],
  limpar: Array(64).fill(0)
};

const legendasMatriz = {
  feliz: "Símbolo atual: Alegria / Bem-estar",
  alerta: "Símbolo atual: Atenção / Pedido de Ajuda",
  seta: "Símbolo atual: Direção / Saída de Emergência",
  limpar: "Matriz apagada (clique nos LEDs para desenhar)"
};

function iniciarMatriz() {
  const grid = document.getElementById('matrizGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 64; i++) {
    const led = document.createElement('div');
    led.className = 'led-ponto';
    led.onclick = () => led.classList.toggle('aceso');
    grid.appendChild(led);
  }
  desenharPadrao('feliz');
}

function desenharPadrao(nome) {
  const leds = document.querySelectorAll('.led-ponto');
  const mapa = padroesMatriz[nome];
  leds.forEach((led, idx) => {
    led.classList.toggle('aceso', mapa[idx] === 1);
  });
  document.getElementById('legendaMatriz').innerText = legendasMatriz[nome];
}

// ==========================================
// 3. SIMULADOR DE CÓDIGO MORSE (LED + SOM)
// ==========================================
const dicionarioMorse = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};

let transmitindo = false;

function tocarBip(duracaoMs) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 650;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duracaoMs);
  } catch (e) {
    // Fallback silencioso se o navegador bloquear áudio
  }
}

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

async function transmitirMorse() {
  if (transmitindo) return;
  const input = document.getElementById('textoMorse').value.toUpperCase().trim();
  if (!input) return;

  transmitindo = true;
  const led = document.getElementById('ledMorse');
  const status = document.getElementById('statusMorse');
  const codigoSpan = document.getElementById('codigoMorseGerado');

  const traduzido = input.split('').map(c => dicionarioMorse[c] || '').join(' ');
  codigoSpan.innerText = traduzido;
  status.innerText = "Transmitindo sinais luminosos e sonoros...";

  for (const simbolo of traduzido) {
    if (simbolo === '.') {
      led.classList.add('ativo');
      tocarBip(180);
      await esperar(180);
      led.classList.remove('ativo');
      await esperar(150);
    } else if (simbolo === '-') {
      led.classList.add('ativo');
      tocarBip(480);
      await esperar(480);
      led.classList.remove('ativo');
      await esperar(150);
    } else {
      await esperar(300);
    }
  }

  status.innerText = "Transmissão concluída!";
  transmitindo = false;
}

// ==========================================
// 4. SIMULADOR DE DISPLAY LCD
// ==========================================
function atualizarDisplay() {
  const l1 = document.getElementById('linha1Input').value || ' ';
  const l2 = document.getElementById('linha2Input').value || ' ';
  document.getElementById('lcdLinha1').innerText = l1;
  document.getElementById('lcdLinha2').innerText = l2;
}

// ==========================================
// 5. GRÁFICO DE DECIBÉIS (FÍSICA)
// ==========================================
function atualizarGraficoSom() {
  const container = document.getElementById('graficoSom');
  if (!container) return;

  const locais = ['Biblioteca', 'Sala de Aula', 'Corredor', 'Pátio / Refeitório'];
  container.innerHTML = '';

  locais.forEach((local, index) => {
    const input = document.getElementById('db' + index);
    const valor = Math.min(120, Math.max(0, Number(input.value) || 0));
    const porcentagem = Math.round((valor / 110) * 100);

    let cor = '#16a34a'; // Verde (confortável)
    if (valor >= 80) cor = '#dc2626'; // Vermelho (intenso)
    else if (valor > 60) cor = '#d97706'; // Amarelo/Laranja (moderado)

    container.innerHTML += `
      <div class="barra-item">
        <div class="barra-label">${local}</div>
        <div class="barra-fundo">
          <div class="barra-preenchimento" style="width: ${Math.min(100, porcentagem)}%; background-color: ${cor};">
            ${valor} dB
          </div>
        </div>
      </div>
    `;
  });
}

// ==========================================
// 6. COFRE DIGITAL (SHA-256 + XOR)
// ==========================================
function alternarSenha() {
  const campo = document.getElementById('senhaMestra');
  const botao = document.getElementById('btnOlho');
  if (campo.type === 'password') {
    campo.type = 'text';
    botao.innerText = '🙈 Ocultar';
  } else {
    campo.type = 'password';
    botao.innerText = '👁️ Mostrar';
  }
}

async function derivarChaveBytes(senha) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

function aplicarXor(dadosBytes, chaveBytes) {
  const resultado = new Uint8Array(dadosBytes.length);
  for (let i = 0; i < dadosBytes.length; i++) {
    resultado[i] = dadosBytes[i] ^ chaveBytes[i % chaveBytes.length];
  }
  return resultado;
}

async function salvarCofreWeb() {
  const senha = document.getElementById('senhaMestra').value;
  const texto = document.getElementById('dadosSecretos').value;
  const resDiv = document.getElementById('resultadoCofre');

  if (!senha || !texto) {
    resDiv.innerText = "⚠️ Por favor, preencha a Senha Mestra e o texto que deseja guardar.";
    return;
  }

  const chave = await derivarChaveBytes(senha);
  const encoder = new TextEncoder();
  const dadosBytes = encoder.encode(texto);
  const cifrado = aplicarXor(dadosBytes, chave);

  const base64 = btoa(String.fromCharCode(...cifrado));
  localStorage.setItem('meu_cofre_seguro_web', base64);

  document.getElementById('dadosSecretos').value = "";
  resDiv.innerText = "✅ Sucesso! Seus dados foram criptografados e trancados com segurança neste navegador.";
}

async function abrirCofreWeb() {
  const senha = document.getElementById('senhaMestra').value;
  const resDiv = document.getElementById('resultadoCofre');
  const base64 = localStorage.getItem('meu_cofre_seguro_web');

  if (!senha) {
    resDiv.innerText = "⚠️ Digite sua Senha Mestra para abrir o cofre.";
    return;
  }
  if (!base64) {
    resDiv.innerText = "ℹ️ Nenhum dado guardado ainda. Salve uma informação primeiro.";
    return;
  }

  try {
    const chave = await derivarChaveBytes(senha);
    const binario = atob(base64);
    const cifrado = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      cifrado[i] = binario.charCodeAt(i);
    }

    const decifrado = aplicarXor(cifrado, chave);
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const textoOriginal = decoder.decode(decifrado);

    resDiv.innerText = "🔓 COFRE ABERTO:\n\n" + textoOriginal;
  } catch (e) {
    resDiv.innerText = "🚫 SENHA INCORRETA! Os dados não puderam ser lidos.";
  }
}

function limparCofreWeb() {
  document.getElementById('senhaMestra').value = "";
  document.getElementById('dadosSecretos').value = "";
  document.getElementById('resultadoCofre').innerText = "Tela limpa! O cofre está fechado.";
}

// Inicializa os simuladores quando a página carrega
window.onload = function() {
  iniciarMatriz();
  atualizarGraficoSom();
};