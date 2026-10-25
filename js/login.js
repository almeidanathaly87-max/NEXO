/* ========================================
   NEXO — TELA DE LOGIN
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // ELEMENTOS DA TELA
    // ========================================

    const formulario = document.getElementById("form-login");
    const usuario = document.getElementById("usuario");
    const senha = document.getElementById("senha");
    const mostrarSenha = document.getElementById("mostrar-senha");
    const mensagem = document.getElementById("mensagem-login");
    const esqueciSenha = document.getElementById("esqueci-senha");
    const criarConta = document.getElementById("criar-conta");

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

    // Aplicar ao abrir a página
    aplicarPreferencias();

    // Aplicar ao retornar à página
    window.addEventListener("pageshow", aplicarPreferencias);

    // Sincronizar alterações feitas em outra aba
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
    // MOSTRAR E OCULTAR SENHA
    // ========================================

    mostrarSenha.addEventListener("click", () => {

        const senhaVisivel = senha.type === "text";

        senha.type = senhaVisivel ? "password" : "text";

        mostrarSenha.setAttribute(
            "aria-label",
            senhaVisivel ? "Mostrar senha" : "Ocultar senha"
        );

    });

    // ========================================
    // REALIZAR LOGIN
    // ========================================

    formulario.addEventListener("submit", (event) => {

        event.preventDefault();

        const identificador = usuario.value.trim().toLowerCase();
        const senhaDigitada = senha.value;

        mensagem.textContent = "";

        // VERIFICAR CAMPOS

        if (!identificador || !senhaDigitada) {

            mensagem.textContent =
                "Preencha todos os campos.";

            return;
        }

        // ========================================
        // BUSCAR CONTAS CADASTRADAS
        // ========================================

        let usuariosCadastrados;

        try {

            usuariosCadastrados = JSON.parse(
                localStorage.getItem("nexo_usuarios") || "[]"
            );

            if (!Array.isArray(usuariosCadastrados)) {
                throw new Error("Dados inválidos");
            }

        } catch (erro) {

            mensagem.textContent =
                "Erro ao carregar os usuários cadastrados.";

            return;
        }

        // ========================================
        // VERIFICAR E-MAIL OU USUÁRIO
        // ========================================

        const contaEncontrada = usuariosCadastrados.find(
            (pessoa) => {

                const email = String(
                    pessoa.email || ""
                ).toLowerCase();

                const nomeUsuario = String(
                    pessoa.usuario || ""
                ).toLowerCase();

                return (
                    email === identificador ||
                    nomeUsuario === identificador
                );
            }
        );

        if (!contaEncontrada) {

            mensagem.textContent =
                "Usuário não encontrado. Verifique seus dados.";

            return;
        }

        // ========================================
        // CRIAR SESSÃO DEMONSTRATIVA
        // ========================================

        // A senha ainda não é validada porque o cadastro
        // atual não implementa autenticação real.

        const usuarioLogado = {
            id: contaEncontrada.id,
            nome: contaEncontrada.nome,
            email: contaEncontrada.email,
            usuario: contaEncontrada.usuario,
            tipo: contaEncontrada.tipo
        };

        try {

            // Chave usada pela tela principal
            localStorage.setItem(
                "nexo_sessao",
                JSON.stringify(usuarioLogado)
            );

            // Mantém compatibilidade com o login anterior
            localStorage.setItem(
                "nexo_usuario_logado",
                JSON.stringify(usuarioLogado)
            );

        } catch (erro) {

            mensagem.textContent =
                "Não foi possível iniciar a sessão.";

            return;
        }

        // ========================================
        // REDIRECIONAR
        // ========================================

        window.location.href = "principal.html";

    });

    // ========================================
    // RECUPERAÇÃO DE SENHA
    // ========================================

    esqueciSenha.addEventListener("click", (event) => {

        event.preventDefault();

        mensagem.textContent =
            "A recuperação de senha ainda não foi implementada.";

    });

    // ========================================
    // IR PARA CADASTRO
    // ========================================

    criarConta.addEventListener("click", (event) => {

        event.preventDefault();

        window.location.href = "cadastro.html";

    });

});