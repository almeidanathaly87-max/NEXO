const form = document.getElementById("cadastroForm");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmacao = document.getElementById("confirmacao").value;

    if (!email || !senha || !confirmacao) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha !== confirmacao) {
        alert("As senhas não são iguais.");
        return;
    }

    try {
        const response = await fetch("/api/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha, confirmacao })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.mensagem);
            return;
        }

        sessionStorage.setItem("token", data.token);

        alert("Conta criada com sucesso! Agora crie seu primeiro perfil.");
        window.location.href = "perfis.html";
    } catch (error) {
        alert("Não foi possível conectar ao servidor.");
        console.error(error);
    }
});