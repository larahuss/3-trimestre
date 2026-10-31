// DADOS INICIAIS
let schoolMeasurements = [
  { local: 'Biblioteca', data: '10/11 - 10:30', db: 42, contexto: 'Estudo silencioso', id: 1 },
  { local: 'Sala de Aula', data: '10/11 - 11:15', db: 65, contexto: 'Explicação do professor', id: 2 },
  { local: 'Corredor', data: '10/11 - 12:00', db: 78, contexto: 'Troca de aceno / intervalo', id: 3 },
  { local: 'Refeitório', data: '10/11 - 12:30', db: 88, contexto: 'Horário do almoço lotado', id: 4 },
  { local: 'Pátio', data: '10/11 - 13:15', db: 72, contexto: 'Alunos reunidos em grupos', id: 5 }
];

let aiLogs = [
  { prompt: 'O que é uma matriz de LEDs e como funciona?', resposta: 'A IA explicou o conceito de acionamento por linhas e colunas.', verificacao: 'Conferido no livro didático de robótica.', alteracao: 'Reescrito com palavras próprias e adicionado exemplo real.', id: 1 },
  { prompt: 'Como funciona a tradução do Código Morse para som?', resposta: 'A IA gerou a tabela de tempos de dits e dahs.', verificacao: 'Testado com o gerador de áudio Web Audio API.', alteracao: 'Ajustada a duração dos beeps no código.', id: 2 }
];

let ledState = Array(64).fill(false);

// TROCA DE ABAS
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const targetContent = document.getElementById(`tab-${tabId}`);
  const targetBtn = document.getElementById(`btn-tab-${tabId}`);

  if (targetContent) targetContent.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
}

// SIMULADOR DE ONDA SONORA
function initSoundSimulator() {
  const freqSlider = document.getElementById('freq-slider');
  const ampSlider = document.getElementById('amp-slider');

  if (!freqSlider || !ampSlider) return;

  function updateWave() {
    const freq = parseInt(freqSlider.value);
    const amp = parseInt(ampSlider.value);

    document.getElementById('freq-val').innerText = `${freq} Hz`;
    document.getElementById('amp-val').innerText = `${amp} dB`;

    const path = document.getElementById('wave-path');
    const width = 600;
    const height = 150;
    const midY = height / 2;

    let d = `M 0 ${midY}`;
    const cycles = freq / 80;
    const amplitude = (amp / 120) * (height / 2 - 10);

    for (let x = 0; x <= width; x += 2) {
      const y = midY + Math.sin((x / width) * cycles * Math.PI * 2) * amplitude;
      d += ` L ${x} ${y}`;
    }
    path.setAttribute('d', d);

    // Diagnóstico
    const soundClass = document.getElementById('sound-class');
    const soundImpact = document.getElementById('sound-impact');
    if (amp < 55) {
      soundClass.innerText = 'Som Confortável / Baixo';
      soundClass.className = 'text-emerald-400 font-bold';
      soundImpact.innerText = 'Excelente para concentração e aprendizagem.';
    } else if (amp < 80) {
      soundClass.innerText = 'Som Moderado';
      soundClass.className = 'text-cyan-400 font-bold';
      soundImpact.innerText = 'Pode gerar leve fadiga após longos períodos.';
    } else {
      soundClass.innerText = 'Alerta de Ruído Elevado';
      soundClass.className = 'text-red-400 font-bold';
      soundImpact.innerText = 'Risco de estresse e desconforto sensorial.';
    }
  }

  freqSlider.addEventListener('input', updateWave);
  ampSlider.addEventListener('input', updateWave);
  updateWave();
}

// TABELA DE MEDIÇÕES
function renderSchoolMeasurements() {
  const tbody = document.getElementById('school-measurements-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  let sumDb = 0;
  let maxDb = -1;
  let minDb = 999;
  let maxLoc = '--';
  let minLoc = '--';

  schoolMeasurements.forEach((item) => {
    sumDb += item.db;
    if (item.db > maxDb) { maxDb = item.db; maxLoc = item.local; }
    if (item.db < minDb) { minDb = item.db; minLoc = item.local; }

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-700/20 transition';
    tr.innerHTML = `
      <td class="p-3 font-semibold text-slate-200">${item.local}</td>
      <td class="p-3 text-slate-400">${item.data}</td>
      <td class="p-3 font-bold ${item.db >= 80 ? 'text-red-400' : 'text-cyan-400'}">${item.db} dB</td>
      <td class="p-3 text-slate-300">${item.contexto}</td>
      <td class="p-3">
        <button onclick="deleteSchoolMeasurementRow(${item.id})" class="text-red-400 hover:text-red-300 text-xs">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const avg = schoolMeasurements.length ? (sumDb / schoolMeasurements.length).toFixed(1) : 0;
  document.getElementById('avg-db').innerText = `${avg} dB`;
  document.getElementById('max-db-loc').innerText = `${maxLoc} (${maxDb > -1 ? maxDb : 0} dB)`;
  document.getElementById('min-db-loc').innerText = `${minLoc} (${minDb < 999 ? minDb : 0} dB)`;
}

function addSchoolMeasurementRow() {
  const local = prompt('Digite o local de medição:', 'Corredor Bloco B');
  if (!local) return;
  const db = parseInt(prompt('Digite o valor em dB:', '65')) || 60;
  const contexto = prompt('O que estava acontecendo no local?', 'Movimento normal de alunos');

  schoolMeasurements.push({
    id: Date.now(),
    local: local,
    data: new Date().toLocaleDateString('pt-BR') + ' - ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    db: db,
    contexto: contexto || 'Registro livre'
  });
  renderSchoolMeasurements();
}

function deleteSchoolMeasurementRow(id) {
  schoolMeasurements = schoolMeasurements.filter(item => item.id !== id);
  renderSchoolMeasurements();
}

// MATRIZ DE LEDS
function initLedGrid() {
  const container = document.getElementById('led-grid-container');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < 64; i++) {
    const btn = document.createElement('div');
    btn.className = `led-cell ${ledState[i] ? 'active' : ''}`;
    btn.addEventListener('click', () => {
      ledState[i] = !ledState[i];
      btn.classList.toggle('active', ledState[i]);
      generateArduinoMatrixCode();
    });
    container.appendChild(btn);
  }
  generateArduinoMatrixCode();
}

function loadLedPreset(preset) {
  ledState.fill(false);
  if (preset === 'smile') {
    [10, 13, 18, 21, 41, 46, 50, 51, 52, 53].forEach(idx => ledState[idx] = true);
  } else if (preset === 'help') {
    [2, 5, 10, 13, 18, 19, 20, 21, 26, 29, 34, 37, 42, 45, 50, 53].forEach(idx => ledState[idx] = true);
  } else if (preset === 'arrow') {
    [3, 11, 19, 27, 35, 43, 51, 59, 12, 20, 28, 21].forEach(idx => ledState[idx] = true);
  }
  initLedGrid();
}

function generateArduinoMatrixCode() {
  const codeEl = document.getElementById('led-matrix-code');
  if (!codeEl) return;

  let lines = [];
  for (let row = 0; row < 8; row++) {
    let rowBinary = 'B';
    for (let col = 0; col < 8; col++) {
      rowBinary += ledState[row * 8 + col] ? '1' : '0';
    }
    lines.push(rowBinary);
  }
  codeEl.innerText = `byte customSymbol[8] = {\n  ${lines.join(',\n  ')}\n};`;
}

// CÓDIGO MORSE
function playMorseCode() {
  const input = document.getElementById('morse-input').value.toUpperCase();
  const led = document.getElementById('morse-led');
  const signalText = document.getElementById('morse-signal-text');

  const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', ' ': '/'
  };

  let morseSeq = input.split('').map(char => morseMap[char] || '').join(' ');
  signalText.innerText = morseSeq || '... --- ...';

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let time = audioCtx.currentTime;

  morseSeq.split('').forEach(symbol => {
    if (symbol === '.') {
      playBeep(audioCtx, time, 0.1);
      triggerVisualLed(led, time, 100);
      time += 0.2;
    } else if (symbol === '-') {
      playBeep(audioCtx, time, 0.3);
      triggerVisualLed(led, time, 300);
      time += 0.4;
    } else {
      time += 0.3;
    }
  });
}

function playBeep(ctx, startTime, duration) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 600;
  gain.gain.setValueAtTime(0.1, startTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function triggerVisualLed(element, startTime, durationMs) {
  setTimeout(() => {
    element.classList.add('bg-amber-400', 'shadow-[0_0_15px_#fbbf24]');
    setTimeout(() => {
      element.classList.remove('bg-amber-400', 'shadow-[0_0_15px_#fbbf24]');
    }, durationMs);
  }, startTime * 1000);
}

// DISPLAY LCD
function updateLcdDisplay() {
  const line1 = document.getElementById('lcd-input-1').value;
  const line2 = document.getElementById('lcd-input-2').value;

  document.getElementById('lcd-line-1').innerText = (line1 + '                ').substring(0, 16);
  document.getElementById('lcd-line-2').innerText = (line2 + '                ').substring(0, 16);
}

// AUDITORIA DE IA
function renderAiLogs() {
  const tbody = document.getElementById('ai-logs-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  aiLogs.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-700/20 transition';
    tr.innerHTML = `
      <td class="p-3 text-cyan-300 font-mono text-xs">${item.prompt}</td>
      <td class="p-3 text-slate-300 text-xs">${item.resposta}</td>
      <td class="p-3 text-slate-400 text-xs">${item.verificacao}</td>
      <td class="p-3 text-emerald-400 text-xs">${item.alteracao}</td>
      <td class="p-3">
        <button onclick="deleteAiLogRow(${item.id})" class="text-red-400 hover:text-red-300 text-xs">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addAiAuditRow() {
  const promptTxt = prompt('Digite o prompt enviado para a IA:');
  if (!promptTxt) return;
  const resposta = prompt('O que a IA respondeu?');
  const verificacao = prompt('Como o grupo verificou essa informação?');
  const alteracao = prompt('O que foi alterado ou corrigido pelo grupo?');

  aiLogs.push({
    id: Date.now(),
    prompt: promptTxt,
    resposta: resposta || 'Sem registro',
    verificacao: verificacao || 'Conferido com fontes escolares',
    alteracao: alteracao || 'Reescrito com autoria própria'
  });
  renderAiLogs();
}

function deleteAiLogRow(id) {
  aiLogs = aiLogs.filter(item => item.id !== id);
  renderAiLogs();
}

// GERENCIADOR DE UPLOAD DE FOTO (MÓDULO ADICIONAL)
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById('preview-user-img');
      const textGroup = document.getElementById('placeholder-text-group');
      const removeBtn = document.getElementById('btn-remove-img');

      img.src = e.target.result;
      img.classList.remove('hidden');
      textGroup.classList.add('hidden');
      removeBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

function removeUserImage() {
  const img = document.getElementById('preview-user-img');
  const textGroup = document.getElementById('placeholder-text-group');
  const removeBtn = document.getElementById('btn-remove-img');
  const input = document.getElementById('user-photo-input');

  img.src = '';
  img.classList.add('hidden');
  textGroup.classList.remove('hidden');
  removeBtn.classList.add('hidden');
  input.value = '';
}

// INICIALIZAÇÃO GERAL
window.onload = function() {
  initSoundSimulator();
  renderSchoolMeasurements();
  initLedGrid();
  updateLcdDisplay();
  renderAiLogs();
};

```