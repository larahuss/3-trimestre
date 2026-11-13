
/* =====================================
   1. SISTEMA DE NAVEGAÇÃO DAS ABAS
===================================== */

const botoesMenu = document.querySelectorAll(".nav-btn");
const secoes = document.querySelectorAll(".aba");

function trocarAba(id, botao) {
  secoes.forEach(secao => {
    secao.classList.remove("active");
  });

  botoesMenu.forEach(item => {
    item.classList.remove("active");
  });

  const secaoSelecionada = document.getElementById(id);

  if (secaoSelecionada) {
    secaoSelecionada.classList.add("active");
  }

  if (botao) {
    botao.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

botoesMenu.forEach(botao => {
  botao.addEventListener("click", () => {
    trocarAba(botao.dataset.aba, botao);
  });
});


/* =====================================
   2. ELEMENTOS DO COFRE
===================================== */

const campoSenha = document.getElementById("senhaMestra");
const campoDados = document.getElementById("dadosSecretos");
const resultado = document.getElementById("resultadoCofre");

const botaoOlho = document.getElementById("alternarSenha");
const botaoSalvar = document.getElementById("salvarCofre");
const botaoAbrir = document.getElementById("abrirCofre");
const botaoLimpar = document.getElementById("limparCofre");

const CHAVE_ARMAZENAMENTO = "cofre_digital_2c";


/* =====================================
   3. MENSAGENS DO COFRE
===================================== */

function mostrarMensagem(mensagem, tipo = "") {
  resultado.textContent = mensagem;
  resultado.className = "resultado";

  if (tipo) {
    resultado.classList.add(tipo);
  }
}


/* =====================================
   4. MOSTRAR E OCULTAR SENHA
===================================== */

botaoOlho.addEventListener("click", () => {
  if (campoSenha.type === "password") {
    campoSenha.type = "text";
    botaoOlho.textContent = "Ocultar";
  } else {
    campoSenha.type = "password";
    botaoOlho.textContent = "Mostrar";
  }
});


/* =====================================
   5. CRIPTOGRAFIA AES-GCM
   PBKDF2 + SHA-256
===================================== */

async function derivarChave(senha, salt) {

  const codificador = new TextEncoder();

  const material = await crypto.subtle.importKey(
    "raw",
    codificador.encode(senha),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 310000,
      hash: "SHA-256"
    },
    material,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}


/* =====================================
   6. SALVAR E CRIPTOGRAFAR
===================================== */

botaoSalvar.addEventListener("click", async () => {

  const senha = campoSenha.value;
  const dados = campoDados.value;

  if (!senha || !dados.trim()) {
    mostrarMensagem(
      "Preencha a senha mestra e as informações que deseja guardar.",
      "erro"
    );
    return;
  }

  if (!window.crypto || !window.crypto.subtle) {
    mostrarMensagem(
      "A criptografia não está disponível neste navegador. Abra o site em HTTPS ou localhost.",
      "erro"
    );
    return;
  }

  botaoSalvar.disabled = true;

  try {
    mostrarMensagem("Criptografando suas informações...");

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const chave = await derivarChave(senha, salt);

    const codificador = new TextEncoder();

    const dadosCriptografados = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      chave,
      codificador.encode(dados)
    );

    const converterBase64 = bytes =>
      btoa(String.fromCharCode(...bytes));

    const arquivo = {
      versao: 1,
      algoritmo: "AES-GCM",
      salt: converterBase64(salt),
      iv: converterBase64(iv),
      dados: converterBase64(
        new Uint8Array(dadosCriptografados)
      )
    };

    localStorage.setItem(
      CHAVE_ARMAZENAMENTO,
      JSON.stringify(arquivo)
    );

    campoDados.value = "";

    mostrarMensagem(
      "Sucesso! Suas informações foram criptografadas e salvas neste navegador.",
      "sucesso"
    );

  } catch (erro) {
    console.error(erro);

    mostrarMensagem(
      "Não foi possível salvar as informações. Verifique o armazenamento do navegador.",
      "erro"
    );

  } finally {
    botaoSalvar.disabled = false;
  }

});


/* =====================================
   7. ABRIR E DESCRIPTOGRAFAR
===================================== */

botaoAbrir.addEventListener("click", async () => {

  const senha = campoSenha.value;

  if (!senha) {
    mostrarMensagem(
      "Digite sua senha mestra para abrir o cofre.",
      "erro"
    );
    return;
  }

  const arquivoSalvo = localStorage.getItem(
    CHAVE_ARMAZENAMENTO
  );

  if (!arquivoSalvo) {
    mostrarMensagem(
      "Nenhum cofre encontrado neste navegador. Salve uma informação primeiro.",
      "erro"
    );
    return;
  }

  botaoAbrir.disabled = true;

  try {
    mostrarMensagem("Verificando a senha mestra...");

    const arquivo = JSON.parse(arquivoSalvo);

    const converterBytes = texto => {
      const binario = atob(texto);
      return Uint8Array.from(
        binario,
        caractere => caractere.charCodeAt(0)
      );
    };

    const salt = converterBytes(arquivo.salt);
    const iv = converterBytes(arquivo.iv);
    const dados = converterBytes(arquivo.dados);

    const chave = await derivarChave(senha, salt);

    const dadosOriginais = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      chave,
      dados
    );

    const decodificador = new TextDecoder();

    const textoOriginal = decodificador.decode(
      dadosOriginais
    );

    mostrarMensagem(
      "COFRE ABERTO!\n\n" + textoOriginal,
      "sucesso"
    );

  } catch (erro) {
    mostrarMensagem(
      "Senha incorreta ou arquivo criptografado inválido. Verifique sua senha mestra.",
      "erro"
    );

  } finally {
    botaoAbrir.disabled = false;
  }

});


/* =====================================
   8. LIMPAR A TELA
===================================== */

botaoLimpar.addEventListener("click", () => {

  campoSenha.value = "";
  campoDados.value = "";

  campoSenha.type = "password";
  botaoOlho.textContent = "Mostrar";

  mostrarMensagem(
    "Tela limpa! O cofre está fechado."
  );

  campoSenha.focus();

});


/* =====================================
   9. PROTEÇÃO AO SAIR DA ABA DO COFRE
===================================== */

document.addEventListener("visibilitychange", () => {

  if (document.hidden) {
    campoSenha.value = "";
    campoDados.value = "";

    campoSenha.type = "password";
    botaoOlho.textContent = "Mostrar";

    mostrarMensagem("Tela protegida. Digite novamente sua senha.");
  }

});


/* =====================================
   10. MENSAGEM INICIAL
===================================== */

console.log(
  "Portal Educacional 2C carregado com sucesso!"
);
