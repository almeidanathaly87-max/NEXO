const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "usuarios.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessoes.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson(file, fallback) {
    if (!fs.existsSync(file)) return fallback;
    try {
        return JSON.parse(fs.readFileSync(file, "utf8") || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf8");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, storedHash] = String(stored).split(":");
    if (!salt || !storedHash) return false;

    const hash = crypto.scryptSync(password, salt, 64).toString("hex");

    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(storedHash, "hex");

    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createId() {
    return crypto.randomUUID();
}

function createSession(accountId) {
    const sessions = readJson(SESSIONS_FILE, {});
    const token = crypto.randomBytes(32).toString("hex");
    sessions[token] = {
        accountId,
        createdAt: Date.now()
    };
    writeJson(SESSIONS_FILE, sessions);
    return token;
}

function getAccountFromRequest(req) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return null;

    const sessions = readJson(SESSIONS_FILE, {});
    const session = sessions[token];

    if (!session) return null;

    const users = readJson(USERS_FILE, []);
    return users.find(user => user.id === session.accountId) || null;
}

function requireAuth(req, res, next) {
    const account = getAccountFromRequest(req);

    if (!account) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Sessão expirada. Faça login novamente."
        });
    }

    req.account = account;
    next();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/cadastro", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");
    const confirmacao = String(req.body.confirmacao || "");

    if (!email || !senha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Preencha e-mail/usuário e senha."
        });
    }

    if (senha.length < 6) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "A senha deve ter pelo menos 6 caracteres."
        });
    }

    if (senha !== confirmacao) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "As senhas não são iguais."
        });
    }

    const users = readJson(USERS_FILE, []);

    if (users.some(user => user.email === email)) {
        return res.status(409).json({
            sucesso: false,
            mensagem: "Essa conta já existe."
        });
    }

    const user = {
        id: createId(),
        email,
        senha: hashPassword(senha),
        perfis: [],
        criadoEm: new Date().toISOString()
    };

    users.push(user);
    writeJson(USERS_FILE, users);

    const token = createSession(user.id);

    res.json({
        sucesso: true,
        token,
        primeiroAcesso: true
    });
});

app.post("/api/login", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const senha = String(req.body.senha || "");

    const users = readJson(USERS_FILE, []);
    const user = users.find(item => item.email === email);

    if (!user || !verifyPassword(senha, user.senha)) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "E-mail/usuário ou senha incorretos."
        });
    }

    const token = createSession(user.id);

    res.json({
        sucesso: true,
        token,
        primeiroAcesso: user.perfis.length === 0
    });
});

app.get("/api/perfis", requireAuth, (req, res) => {
    res.json({
        sucesso: true,
        perfis: req.account.perfis
    });
});

app.post("/api/perfis", requireAuth, (req, res) => {
    const nome = String(req.body.nome || "").trim();
    const avatar = String(req.body.avatar || "avatar1").trim();

    if (!nome) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Digite o nome do perfil."
        });
    }

    if (nome.length > 30) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "O nome deve ter no máximo 30 caracteres."
        });
    }

    if (req.account.perfis.length >= 6) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Essa conta já possui o limite de 6 perfis."
        });
    }

    const users = readJson(USERS_FILE, []);
    const userIndex = users.findIndex(user => user.id === req.account.id);

    const novoPerfil = {
        id: createId(),
        nome,
        avatar,
        criadoEm: new Date().toISOString()
    };

    users[userIndex].perfis.push(novoPerfil);
    writeJson(USERS_FILE, users);

    res.json({
        sucesso: true,
        perfil: novoPerfil
    });
});

app.delete("/api/perfis/:id", requireAuth, (req, res) => {
    const users = readJson(USERS_FILE, []);
    const userIndex = users.findIndex(user => user.id === req.account.id);

    const antes = users[userIndex].perfis.length;

    users[userIndex].perfis = users[userIndex].perfis.filter(
        perfil => perfil.id !== req.params.id
    );

    if (users[userIndex].perfis.length === antes) {
        return res.status(404).json({
            sucesso: false,
            mensagem: "Perfil não encontrado."
        });
    }

    writeJson(USERS_FILE, users);

    res.json({
        sucesso: true,
        mensagem: "Perfil removido."
    });
});

app.post("/api/logout", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
        const sessions = readJson(SESSIONS_FILE, {});
        delete sessions[token];
        writeJson(SESSIONS_FILE, sessions);
    }

    res.json({ sucesso: true });
});

app.listen(PORT, () => {
    console.log(`Nexo rodando em http://localhost:${PORT}`);
});