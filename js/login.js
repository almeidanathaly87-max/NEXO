/*== Nexo - tela de login ==*/

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("form-login");
    const usuario = document.getElementById("usuario");
    const senha = document.getElementById("senha");
    const mostrarSenha = document.getElementById("mostrar-senha");
    const mensagem = document.getElementById("mensagem-login");
    const esqueciSenha = document.getElementById("esqueci-senha");
    const criarConta = document.getElementById("criar-conta");

    if (!formulario || !usuario || !senha || !mostrarSenha || !mensagem || !esqueciSenha || !criarConta) {
        return;
    }

    // Mostrar e ocultar senha
    mostrarSenha.addEventListener("click", () => {
        const senhaVisivel = senha.type === "text";
        senha.type = senhaVisivel ? "password" : "text";
        mostrarSenha.setAttribute(
            "aria-label",
            senhaVisivel ? "Mostrar senha" : "Ocultar senha"
        );
    });

    // Validação inicial do formulário
    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const nomeUsuario = usuario.value.trim();
        const senhaDigitada = senha.value;

        if (!nomeUsuario || !senhaDigitada) {
            mensagem.textContent = "Preencha todos os campos.";
            return;
        }

        mensagem.textContent = "Interface pronta. A autenticação será conectada posteriormente.";
    });

    // Recuperação de senha
    esqueciSenha.addEventListener("click", (event) => {
        event.preventDefault();
        mensagem.textContent = "A recuperação de senha ainda será implementada.";
    });

    // Cadastro
    criarConta.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = "cadastro.html";
    });
});
