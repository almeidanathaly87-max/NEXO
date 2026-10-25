/* ========================================
   NEXO — TELA INICIAL
======================================== */

(() => {
    "use strict";

    const CHAVE_TEMA = "nexo_tema";
    const CHAVE_FONTE = "nexo_fonte";

    // ========================================
    // TEMA CLARO E ESCURO
    // ========================================

    function aplicarTema() {
        const temaSalvo = localStorage.getItem(CHAVE_TEMA);

        const temaEscuro = temaSalvo === "escuro";

        document.documentElement.classList.toggle(
            "tema-escuro",
            temaEscuro
        );

        document.body.classList.toggle(
            "tema-escuro",
            temaEscuro
        );
    }

    // ========================================
    // TAMANHO DA FONTE
    // ========================================

    function aplicarFonte() {
        const valorSalvo = Number(
            localStorage.getItem(CHAVE_FONTE)
        );

        const escala = Number.isFinite(valorSalvo) && valorSalvo > 0
            ? Math.min(1.3, Math.max(0.9, valorSalvo))
            : 1;

        document.documentElement.style.setProperty(
            "--escala",
            escala
        );
    }

    // ========================================
    // PREFERÊNCIAS SALVAS
    // ========================================

    function aplicarPreferencias() {
        aplicarTema();
        aplicarFonte();
    }

    aplicarPreferencias();

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            aplicarPreferencias();

            // BOTÃO COMEÇAR
            const botaoComecar = document.getElementById(
                "botao-comecar"
            );

            if (botaoComecar) {
                botaoComecar.addEventListener("click", () => {
                    window.location.href = "login.html";
                });
            }
        }
    );

    // ATUALIZAR AO RETORNAR PARA A PÁGINA
    window.addEventListener("pageshow", aplicarPreferencias);

    window.addEventListener("focus", aplicarPreferencias);

    // ATUALIZAR SE A PREFERÊNCIA MUDAR EM OUTRA ABA
    window.addEventListener("storage", (event) => {
        if (
            event.key === CHAVE_TEMA ||
            event.key === CHAVE_FONTE ||
            event.key === null
        ) {
            aplicarPreferencias();
        }
    });

})();