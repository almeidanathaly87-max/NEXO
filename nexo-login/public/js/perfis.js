const token = sessionStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const profilesGrid = document.getElementById("profilesGrid");
const emptyState = document.getElementById("emptyState");
const addProfileButton = document.getElementById("addProfileButton");
const firstProfileButton = document.getElementById("firstProfileButton");
const modal = document.getElementById("profileModal");
const closeModal = document.getElementById("closeModal");
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const logoutButton = document.getElementById("logoutButton");

let selectedAvatar = "avatar1";

const avatarMap = {
    avatar1: "👩",
    avatar2: "👨",
    avatar3: "👩🏻",
    avatar4: "👨🏻",
    avatar5: "🧑"
};

async function carregarPerfis() {
    const response = await fetch("/api/perfis", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        sessionStorage.clear();
        window.location.href = "index.html";
        return;
    }

    const data = await response.json();
    renderizarPerfis(data.perfis);
}

function renderizarPerfis(perfis) {
    profilesGrid.innerHTML = "";

    if (perfis.length === 0) {
        emptyState.classList.remove("hidden");
        addProfileButton.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    perfis.forEach(perfil => {
        const card = document.createElement("article");
        card.className = "profile-card";

        card.innerHTML = `
            <button class="profile-main">
                <div class="avatar">${avatarMap[perfil.avatar] || "🧑"}</div>
                <strong>${escapeHtml(perfil.nome)}</strong>
                <span>Perfil</span>
            </button>
            <button class="delete-profile" title="Excluir perfil">×</button>
        `;

        card.querySelector(".profile-main").addEventListener("click", () => {
            sessionStorage.setItem("perfilSelecionado", JSON.stringify(perfil));
            window.location.href = "principal.html";
        });

        card.querySelector(".delete-profile").addEventListener("click", async (event) => {
            event.stopPropagation();

            if (!confirm(`Excluir o perfil "${perfil.nome}"?`)) return;

            const response = await fetch(`/api/perfis/${perfil.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.mensagem);
                return;
            }

            carregarPerfis();
        });

        profilesGrid.appendChild(card);
    });

    if (perfis.length < 6) {
        addProfileButton.classList.remove("hidden");
    } else {
        addProfileButton.classList.add("hidden");
    }
}

function abrirModal() {
    modal.classList.remove("hidden");
    profileName.focus();
}

function fecharModal() {
    modal.classList.add("hidden");
    profileName.value = "";
}

document.querySelectorAll(".avatar-option").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".avatar-option").forEach(item =>
            item.classList.remove("selected")
        );

        button.classList.add("selected");
        selectedAvatar = button.dataset.avatar;
    });
});

addProfileButton.addEventListener("click", abrirModal);
firstProfileButton.addEventListener("click", abrirModal);
closeModal.addEventListener("click", fecharModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        fecharModal();
    }
});

profileForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nome = profileName.value.trim();

    if (!nome) {
        alert("Digite o nome do perfil.");
        return;
    }

    const response = await fetch("/api/perfis", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            nome,
            avatar: selectedAvatar
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.mensagem);
        return;
    }

    fecharModal();
    await carregarPerfis();
});

logoutButton.addEventListener("click", async () => {
    await fetch("/api/logout", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    sessionStorage.clear();
    window.location.href = "index.html";
});

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

carregarPerfis();