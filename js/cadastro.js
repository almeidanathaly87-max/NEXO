
/* NEXO — TELA DE CADASTRO */

document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.getElementById("form-cadastro");

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const usuario = document.getElementById("usuario");
    const senha = document.getElementById("senha");
    const confirmarSenha = document.getElementById("confirmar-senha");

    const mensagem = document.getElementById("mensagem-cadastro");

    // MOSTRAR E OCULTAR SENHAS

    const botoesMostrar = document.querySelectorAll(".mostrar-senha");

    botoesMostrar.forEach((botao) => {

        botao.addEventListener("click", () => {

            const idCampo = botao.dataset.alvo;
            const campo = document.getElementById(idCampo);

            const estaVisivel = campo.type === "text";

            campo.type = estaVisivel ? "password" : "text";

            botao.textContent = estaVisivel ? "Mostrar" : "Ocultar";

            botao.setAttribute(
                "aria-label",
                estaVisivel ? "Mostrar senha" : "Ocultar senha"
            );

        });

    });

    // VALIDAR CADASTRO

    formulario.addEventListener("submit", (event) => {

        event.preventDefault();

        mensagem.classList.remove("sucesso");

        const nomeDigitado = nome.value.trim();
        const emailDigitado = email.value.trim();
        const usuarioDigitado = usuario.value.trim();
        const senhaDigitada = senha.value;
        const confirmacao = confirmarSenha.value;

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

        if (senhaDigitada.length < 8) {
            mensagem.textContent =
                "A senha precisa ter pelo menos 8 caracteres.";
            return;
        }

        if (senhaDigitada !== confirmacao) {
            mensagem.textContent = "As senhas não coincidem.";
            return;
        }

        // Ainda não existe salvamento no banco de dados.
        // Não armazenamos senhas no navegador.

        mensagem.classList.add("sucesso");
        mensagem.textContent =
            "Dados validados! O cadastro será ativado com o backend.";

    });

});