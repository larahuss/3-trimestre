// ==========================================
// 1. NAVEGAÇÃO POR ABAS
// ==========================================
function abrirAba(idAba, botao) {
  document.querySelectorAll('.secao').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(idAba).classList.add('active');
  botao.classList.add('active');
}

// ==========================================
// 2. ACESSIBILIDADE (TAMANHO DE FONTE E CONTRASTE)
// ==========================================
let tamanhoFonteAtual = 18;

function alterarFonte(delta) {
  tamanhoFonteAtual = Math.min(26, Math.max(14, tamanhoFonteAtual + delta));
  document.documentElement.style.setProperty('--font-size-base', tamanhoFonteAtual + 'px');
}

function alternarContraste() {
  document.body.classList.toggle('alto-contraste');
}

// ==========================================
// 3. COFRE DIGITAL EM JAVASCRIPT (SHA-256 + XOR)
// ==========================================
function alternarSenha() {
  const campo = document.getElementById('senhaMestra');
  campo.type = campo.type === 'password' ? 'text' : 'password';
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

  // Converte para Base64 e salva no armazenamento local do navegador
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