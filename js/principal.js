/* NEXO — TELA PRINCIPAL (PROTÓTIPO LOCAL) */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const chave = "nexo_principal_demo_v1";
  const app = document.querySelector(".app");
  const exemplo = {
    meta: { nome: "Minha recompensa", pontosNecessarios: 100, previsao: "a definir pelo responsável" },
    tarefas: [
      { id: "t1", nome: "Arrumar a cama", icone: "🛏️", pontos: 10, concluida: false },
      { id: "t2", nome: "Organizar o quarto", icone: "🧸", pontos: 20, concluida: false },
      { id: "t3", nome: "Guardar os materiais", icone: "📚", pontos: 15, concluida: false }
    ],
    registros: [], pontos: 0
  };
  function lerJSON(nome, padrao) { try { const valor = JSON.parse(localStorage.getItem(nome)); return valor ?? padrao; } catch { return padrao; } }
  let estado = lerJSON(chave, null);
  if (!estado || !Array.isArray(estado.tarefas) || !Array.isArray(estado.registros)) estado = structuredClone(exemplo);
  function salvar() { try { localStorage.setItem(chave, JSON.stringify(estado)); return true; } catch { return false; } }
  const sessao = lerJSON("nexo_sessao", null);
  const usuarios = lerJSON("nexo_usuarios", []);
  const pessoa = sessao && Array.isArray(usuarios) ? usuarios.find(u => u.id === sessao.id || u.usuario === sessao.usuario) : null;
  const nome = pessoa?.nome || "Visitante";
  $("titulo-inicio").textContent = `Olá, ${nome.split(" ")[0]}! ✦`;
  $("perfil-nome").textContent = pessoa?.nome || "Perfil de demonstração";
  $("perfil-usuario").textContent = pessoa?.usuario ? `@${pessoa.usuario}` : "Dados locais de exemplo";
  function mostrar(aba) {
    const destino = ["inicio", "tarefas", "lacos", "perfil", "configuracoes"].includes(aba) ? aba : "inicio";
    document.querySelectorAll(".pagina").forEach(p => { p.hidden = p.id !== destino; });
    document.querySelectorAll(".nav-item").forEach(b => {
      const ativo = b.dataset.ir === (destino === "configuracoes" ? "perfil" : destino);
      b.classList.toggle("ativo", ativo);
      if (ativo) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("[data-ir]").forEach(b => b.addEventListener("click", () => mostrar(b.dataset.ir)));
  function atualizarMeta() {
    const maximo = Math.max(1, Number(estado.meta.pontosNecessarios) || 100);
    const pontos = Math.max(0, Number(estado.pontos) || 0);
    const percentual = Math.min(100, Math.round(pontos / maximo * 100));
    $("meta-nome").textContent = estado.meta.nome;
    $("pontos-atuais").textContent = pontos;
    $("pontos-meta").textContent = maximo;
    $("previsao").textContent = estado.meta.previsao;
    $("preenchimento").style.width = `${percentual}%`;
    $("progresso-texto").textContent = `${percentual}% da meta alcançada`;
    $("barra-meta").setAttribute("aria-valuemax", maximo);
    $("barra-meta").setAttribute("aria-valuenow", Math.min(pontos, maximo));
    $("perfil-pontuacao").textContent = pontos;
  }
  function criarTarefa(tarefa) {
    const artigo = document.createElement("article"); artigo.className = "tarefa";
    const icone = document.createElement("span"); icone.className = "tarefa-icone"; icone.textContent = tarefa.icone;
    const info = document.createElement("div"); info.className = "tarefa-info";
    const titulo = document.createElement("h3"); titulo.textContent = tarefa.nome;
    const subtitulo = document.createElement("p"); subtitulo.textContent = `+${tarefa.pontos} pontos`;
    info.append(titulo, subtitulo);
    const botao = document.createElement("button"); botao.type = "button";
    botao.textContent = tarefa.concluida ? "Concluída ✓" : "📷 Fazer";
    botao.disabled = tarefa.concluida;
    if (!tarefa.concluida) botao.addEventListener("click", () => abrirCamera(tarefa.id));
    artigo.append(icone, info, botao); return artigo;
  }
  function atualizarTarefas() {
    $("tarefas-inicio").replaceChildren(...estado.tarefas.slice(0, 3).map(criarTarefa));
    $("tarefas-lista").replaceChildren(...estado.tarefas.map(criarTarefa));
  }
  function atualizarLacos() {
    const area = $("registros-lista"); area.replaceChildren();
    if (!estado.registros.length) {
      const vazio = document.createElement("p"); vazio.className = "vazio";
      vazio.textContent = "Quando você concluir uma tarefa com foto, o registro aparecerá aqui.";
      area.append(vazio); return;
    }
    [...estado.registros].reverse().forEach(reg => {
      const cartao = document.createElement("article"); cartao.className = "registro";
      const cab = document.createElement("div"); cab.className = "registro-cabecalho";
      const icone = document.createElement("span"); icone.className = "registro-icone"; icone.textContent = "✨";
      const info = document.createElement("div"); const titulo = document.createElement("h3"); titulo.textContent = reg.tarefa;
      const data = document.createElement("small"); data.textContent = new Date(reg.data).toLocaleDateString("pt-BR");
      info.append(titulo, data); cab.append(icone, info); cartao.append(cab);
      if (reg.foto) { const foto = document.createElement("img"); foto.src = reg.foto; foto.alt = `Comprovação: ${reg.tarefa}`; cartao.append(foto); }
      const rodape = document.createElement("div"); rodape.className = "registro-rodape";
      const pontos = document.createElement("span"); pontos.textContent = `+${reg.pontos} pontos`;
      const reagir = document.createElement("button"); reagir.type = "button"; reagir.className = "reagir";
      reagir.setAttribute("aria-pressed", String(Boolean(reg.reagiu)));
      reagir.textContent = reg.reagiu ? "♥ Reagiu" : "♡ Reagir";
      reagir.addEventListener("click", () => { reg.reagiu = !reg.reagiu; if (!salvar()) alert("Não foi possível salvar a reação."); atualizarLacos(); });
      rodape.append(pontos, reagir); cartao.append(rodape); area.append(cartao);
    });
  }
  let stream = null, tarefaAtual = null, fotoAtual = null;
  const dialogo = $("dialogo-foto");
  function pararCamera() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } $("camera-video").srcObject = null; }
  async function iniciarCamera() {
    $("camera-erro").textContent = ""; $("camera-video").hidden = false; $("foto-capturada").hidden = true;
    $("capturar-foto").hidden = false; $("repetir-foto").hidden = true; $("confirmar-tarefa").hidden = true;
    fotoAtual = null;
    if (!navigator.mediaDevices?.getUserMedia) { $("camera-erro").textContent = "Câmera indisponível. Abra pelo Live Server em localhost ou HTTPS, em um dispositivo com câmera."; $("capturar-foto").disabled = true; return; }
    try { stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
      if (!dialogo.open) { pararCamera(); return; }
      $("camera-video").srcObject = stream; await $("camera-video").play(); $("capturar-foto").disabled = false;
    } catch { $("camera-erro").textContent = "Não foi possível acessar a câmera. Verifique a permissão do navegador."; $("capturar-foto").disabled = true; }
  }
  function abrirCamera(id) { tarefaAtual = estado.tarefas.find(t => t.id === id && !t.concluida); if (!tarefaAtual) return;
    $("tarefa-foto-nome").textContent = tarefaAtual.nome; dialogo.showModal(); iniciarCamera(); }
  function fecharCamera() { pararCamera(); tarefaAtual = null; fotoAtual = null; if (dialogo.open) dialogo.close(); }
  $("fechar-camera").addEventListener("click", fecharCamera);
  dialogo.addEventListener("cancel", e => { e.preventDefault(); fecharCamera(); });
  $("capturar-foto").addEventListener("click", () => {
    const video = $("camera-video"); if (!video.videoWidth) return;
    const canvas = $("camera-canvas"); const limite = 640; const proporcao = Math.min(1, limite / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * proporcao); canvas.height = Math.round(video.videoHeight * proporcao);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    fotoAtual = canvas.toDataURL("image/jpeg", .65); pararCamera();
    $("foto-capturada").src = fotoAtual; $("foto-capturada").hidden = false; $("camera-video").hidden = true;
    $("capturar-foto").hidden = true; $("repetir-foto").hidden = false; $("confirmar-tarefa").hidden = false;
  });
  $("repetir-foto").addEventListener("click", iniciarCamera);
  $("confirmar-tarefa").addEventListener("click", () => {
    if (!tarefaAtual || !fotoAtual) return;
    const registro = {id: Date.now(), tarefa: tarefaAtual.nome, pontos: tarefaAtual.pontos, data: new Date().toISOString(), foto: fotoAtual, reagiu:false};
    tarefaAtual.concluida = true; estado.pontos += tarefaAtual.pontos; estado.registros.push(registro);
    if (!salvar()) { tarefaAtual.concluida = false; estado.pontos -= tarefaAtual.pontos; estado.registros.pop(); $("camera-erro").textContent = "Não foi possível salvar a foto. O armazenamento do navegador pode estar cheio."; return; }
    fecharCamera(); atualizarTudo(); mostrar("lacos");
  });
  function atualizarTudo() { atualizarMeta(); atualizarTarefas(); atualizarLacos(); }
  let escala = Math.min(1.3, Math.max(.9, Number(localStorage.getItem("nexo_fonte")) || 1));
  function aplicarFonte() { app.style.setProperty("--escala", escala); document.documentElement.style.setProperty("--escala", escala); $("fonte-valor").textContent = `${Math.round(escala*100)}%`; try{localStorage.setItem("nexo_fonte", String(escala));}catch{} }
  $("fonte-menor").addEventListener("click", () => { escala = Math.max(.9, Math.round((escala-.1)*10)/10); aplicarFonte(); });
  $("fonte-maior").addEventListener("click", () => { escala = Math.min(1.3, Math.round((escala+.1)*10)/10); aplicarFonte(); });
  function aplicarTema(tema) { app.classList.toggle("tema-escuro", tema === "escuro");
    $("tema-claro").setAttribute("aria-pressed", String(tema !== "escuro")); $("tema-escuro").setAttribute("aria-pressed", String(tema === "escuro"));
    try{localStorage.setItem("nexo_tema",tema);}catch{} }
  $("tema-claro").addEventListener("click", () => aplicarTema("claro"));
  $("tema-escuro").addEventListener("click", () => aplicarTema("escuro"));
  $("sair").addEventListener("click", () => { localStorage.removeItem("nexo_sessao"); window.location.href = "login.html"; });
  aplicarFonte(); aplicarTema(localStorage.getItem("nexo_tema") || "claro"); atualizarTudo(); mostrar("inicio");
})();
