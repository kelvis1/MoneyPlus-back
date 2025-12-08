import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

import path from "path"; 
import os from "os";

const tmpDir = os.tmpdir();
const dbPath = path.join(tmpDir, "database.db");

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

app.get("/", (req, res) => {
  res.json({ message: "API de Produtos com SQLite", status: 'ok' });
});




app.post("/registro", (req, res) => {
  const { name, email, password } = req.body;

  // Verifica se já existe o usuário
  const userExists = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (userExists) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }

  // Criptografa senha
  const hashed = bcrypt.hashSync(password, 10);

  // Insere no banco
  db.prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
  ).run(name, email, hashed);

  return res.json({ message: "Usuário registrado com sucesso!" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Busca usuário pelo email
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (!user) {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }

  // Valida senha
  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) {
    return res.status(400).json({ error: "Email ou senha inválidos" });
  }

  // Gera token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "2h" }
  );

  return res.json({ message: "Login efetuado!", token });
});


const port = 3000;

app.listen(port, () => {
  console.log("Server is running");
});

export default app;