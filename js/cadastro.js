/* ========================================
   NEXO — TELA DE CADASTRO
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // ELEMENTOS DO FORMULÁRIO
    // ========================================

    const formulario = document.getElementById("form-cadastro");

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const usuario = document.getElementById("usuario");
    const senha = document.getElementById("senha");
    const confirmarSenha = document.getElementById("confirmar-senha");

    const mensagem = document.getElementById("mensagem-cadastro");

    // ========================================
    // PREFERÊNCIAS DE ACESSIBILIDADE
    // ========================================

    function aplicarPreferencias() {

        const temaSalvo =
            localStorage.getItem("nexo_tema") || "claro";

        const temaEscuro = temaSalvo === "escuro";

        document.documentElement.classList.toggle(
            "tema-escuro",
            temaEscuro
        );

        document.body.classList.toggle(
            "tema-escuro",
            temaEscuro
        );

        const fonteSalva = Number(
            localStorage.getItem("nexo_fonte")
        ) || 1;

        const escala = Math.min(
            1.3,
            Math.max(0.9, fonteSalva)
        );

        document.documentElement.style.setProperty(
            "--escala",
            escala
        );
    }

    aplicarPreferencias();

    window.addEventListener(
        "pageshow",
        aplicarPreferencias
    );

    window.addEventListener("storage", (event) => {

        if (
            event.key === "nexo_tema" ||
            event.key === "nexo_fonte" ||
            event.key === null
        ) {
            aplicarPreferencias();
        }

    });

    // ========================================
    // MOSTRAR E OCULTAR SENHAS
    // ========================================

    const botoesMostrar = document.querySelectorAll(
        ".mostrar-senha"
    );

    botoesMostrar.forEach((botao) => {

        botao.addEventListener("click", () => {

            const idCampo = botao.dataset.alvo;
            const campo = document.getElementById(idCampo);

            if (!campo) return;

            const estaVisivel = campo.type === "text";

            campo.type = estaVisivel ? "password" : "text";

            botao.textContent = estaVisivel
                ? "Mostrar"
                : "Ocultar";

            botao.setAttribute(
                "aria-label",
                estaVisivel
                    ? "Mostrar senha"
                    : "Ocultar senha"
            );

        });

    });

    // ========================================
    // VALIDAR E SALVAR CADASTRO
    // ========================================

    formulario.addEventListener("submit", (event) => {

        event.preventDefault();

        mensagem.classList.remove("sucesso");
        mensagem.textContent = "";

        const nomeDigitado = nome.value.trim();
        const emailDigitado = email.value.trim().toLowerCase();
        const usuarioDigitado = usuario.value.trim();
        const senhaDigitada = senha.value;
        const confirmacao = confirmarSenha.value;

        // VERIFICAR CAMPOS OBRIGATÓRIOS

        if (
            !nomeDigitado ||
            !emailDigitado ||
            !usuarioDigitado ||
            !senhaDigitada ||
            !confirmacao
        ) {
            mensagem.textContent = "Preencha todos os campos.";
            return;
        }

        // VALIDAR TAMANHO DA SENHA

        if (senhaDigitada.length < 8) {
            mensagem.textContent =
                "A senha precisa ter pelo menos 8 caracteres.";
            return;
        }

        // COMPARAR SENHAS

        if (senhaDigitada !== confirmacao) {
            mensagem.textContent = "As senhas não coincidem.";
            return;
        }

        // ========================================
        // CONSULTAR CADASTROS EXISTENTES
        // ========================================

        let usuarios;

        try {

            usuarios = JSON.parse(
                localStorage.getItem("nexo_usuarios") || "[]"
            );

            if (!Array.isArray(usuarios)) {
                throw new Error("Dados inválidos");
            }

        } catch (erro) {

            mensagem.textContent =
                "Não foi possível ler os cadastros salvos.";

            return;
        }

        // ========================================
        // VERIFICAR CADASTRO DUPLICADO
        // ========================================

        const jaExiste = usuarios.some((pessoa) => {

            const emailExistente = String(
                pessoa.email || ""
            ).toLowerCase();

            const usuarioExistente = String(
                pessoa.usuario || ""
            ).toLowerCase();

            return (
                emailExistente === emailDigitado ||
                usuarioExistente === usuarioDigitado.toLowerCase()
            );

        });

        if (jaExiste) {

            mensagem.textContent =
                "Este e-mail ou nome de usuário já está cadastrado.";

            return;
        }

        // ========================================
        // CRIAR CADASTRO DEMONSTRATIVO
        // ========================================

        // A senha não é armazenada.
        // A autenticação real será implementada depois.

        const novoUsuario = {
            id: crypto.randomUUID(),
            nome: nomeDigitado,
            email: emailDigitado,
            usuario: usuarioDigitado,
            tipo: "responsavel"
        };

        usuarios.push(novoUsuario);

        // ========================================
        // SALVAR USUÁRIO
        // ========================================

        try {

            localStorage.setItem(
                "nexo_usuarios",
                JSON.stringify(usuarios)
            );

        } catch (erro) {

            mensagem.textContent =
                "Não foi possível salvar o cadastro neste navegador.";

            return;
        }

        // ========================================
        // CONFIRMAR CADASTRO
        // ========================================

        mensagem.classList.add("sucesso");

        mensagem.textContent =
            "Cadastro de demonstração realizado com sucesso!";

        formulario.reset();

    });

});