import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = "seu_token_super_secreto";
const app = express();
const port = 3000;

// ----------- Banco de Dados -----------
export async function openDb() {
  return open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
}

// Cria tabela automaticamente
openDb().then(db => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

// ----------- Middlewares -----------
app.use(cors());
app.use(express.json());

// ----------- Rotas -----------
app.get("/", (req, res) => {
  res.send("Hello, World! This is your Express API demo.");
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    message: "API funcionando corretamente!",
    timestamp: new Date().toISOString(),
  });
});

app.post("/registro", async (req, res) => {
  const { name, email, password } = req.body;
  const db = await openDb();

  const userExists = await db.get(
    "SELECT * FROM users WHERE email = ?",
    email
  );

  if (userExists) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashed]
  );

  return res.json({ message: "Usuário registrado com sucesso!" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = await openDb();

  const user = await db.get("SELECT * FROM users WHERE email = ?", email);

  if (!user) {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "2h" }
  );

  return res.json({ message: "Login efetuado!", token });
});

// ----------- Servidor -----------
app.listen(port, () => {
  console.log("Server is running");
});

// ----------- Export igual ao seu outro código -----------
export default app;
