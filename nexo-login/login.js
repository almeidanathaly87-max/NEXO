const form = document.getElementById("loginForm");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
    const input = document.getElementById("senha");
    input.type = input.type === "password" ? "text" : "password";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.mensagem);
            return;
        }

        sessionStorage.setItem("token", data.token);

        // Primeiro acesso: a conta ainda não tem perfis.
        // O usuário será levado para a tela que permite criar o primeiro.
        window.location.href = "perfis.html";
    } catch (error) {
        alert("Não foi possível conectar ao servidor.");
        console.error(error);
    }
});