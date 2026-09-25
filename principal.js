// ==========================================
// ELEMENTOS DA TELA
// ==========================================

const botaoTarefas =
    document.getElementById("botao-tarefas");

const botaoFeed =
    document.getElementById("botao-feed");

const botaoAtualizar =
    document.getElementById("botao-atualizar");


const areaTarefas =
    document.getElementById("area-tarefas");

const areaFeed =
    document.getElementById("area-feed");


// ==========================================
// ABRIR TAREFAS
// ==========================================

botaoTarefas.addEventListener("click", function () {

    botaoTarefas.classList.add("ativo");

    botaoFeed.classList.remove("ativo");


    areaTarefas.classList.add("ativo");

    areaFeed.classList.remove("ativo");

});


// ==========================================
// ABRIR FEED
// ==========================================

botaoFeed.addEventListener("click", function () {

    botaoFeed.classList.add("ativo");

    botaoTarefas.classList.remove("ativo");


    areaFeed.classList.add("ativo");

    areaTarefas.classList.remove("ativo");

});


// ==========================================
// ANIMAÇÃO DO BOTÃO CENTRAL
// ==========================================

botaoAtualizar.addEventListener("click", function () {

    botaoAtualizar.classList.add("girando");


    setTimeout(function () {

        botaoAtualizar.classList.remove("girando");

    }, 300);

});