// ==========================================
// TELA INICIAL - NEXO
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const botaoComecar = document.getElementById("botao-comecar");

    if (botaoComecar) {
        botaoComecar.addEventListener("click", function () {
            window.location.href = "principal.html";
        });
    }
});