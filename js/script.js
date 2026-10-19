
/* ========================================
   NEXO — TELA INICIAL
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    const botaoComecar = document.getElementById("botao-comecar");

    if (!botaoComecar) {
        console.error("Botão Começar não encontrado.");
        return;
    }

    botaoComecar.addEventListener("click", () => {

        // Abre a tela de login quando ela existir.
        window.location.href = "login.html";

    });

});
