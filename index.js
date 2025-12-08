import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import os from "os";

const SECRET = "seu_token_super_secreto";

// Caminho do banco (persistente no tmp)
const tmpDir = os.tmpdir();
const dbPath = path.join(tmpDir, "database.db");

const app = express();
app.use(cors());
app.use(express.json());

// Banco SQLite
const db = new Database(dbPath);

// Criação da tabela
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

// -------------------- ROTAS --------------------

app.get("/", (req, res) => {
  return res.json({
    message: "API de Usuários com SQLite",
    status: "ok"
  });
});

// 🔍 Rota para listar todos os usuários (retira a senha)
app.get("/users", (req, res, next) => {
  try {
    const users = db.prepare("SELECT id, name, email FROM users").all();
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

// 📌 Registro
app.post("/registro", (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Dados incompletos" });

    const userExists = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (userExists)
      return res.status(400).json({ error: "Email já cadastrado" });

    const hashed = bcrypt.hashSync(password, 10);

    db.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    ).run(name, email, hashed);

    return res.json({ message: "Usuário registrado com sucesso!" });

  } catch (err) {
    next(err);
  }
});

// 🔑 Login
app.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Dados incompletos" });

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (!user)
      return res.status(400).json({ error: "Email ou senha inválidos" });

    const valid = bcrypt.compareSync(password, user.password);

    if (!valid)
      return res.status(400).json({ error: "Email ou senha inválidos" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ message: "Login efetuado!", token });

  } catch (err) {
    next(err);
  }
});

// -------------------- MIDDLEWARE DE ERROS --------------------
app.use((err, req, res, next) => {
  console.error("❌ ERRO NO SERVIDOR:", err.message);
  return res.status(500).json({
    error: "Erro interno no servidor",
    details: err.message
  });
});

// -------------------- SERVIDOR --------------------
const port = 3000;
app.listen(port, () => console.log("Server is running"));

export default app;
