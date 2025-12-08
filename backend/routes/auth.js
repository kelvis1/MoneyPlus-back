import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { openDb } from "../db.js";


const router = express.Router();
const SECRET = "seu_token";

router.get("/status", (req, res) => {
    res.json({
        status: "online",
        message: "API funcionando corretamente!",
        timestamp: new Date().toISOString(),
    });
});

//Registro
router.post("/registro", async (req, res) => {
    const { name, email, password } = req.body;

    const db = await openDb();

    const userExists = await db.get("SELECT * FROM users WHERE email = ?", email);
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

//Login
router.post("/login", async (req, res) => {
    const {email, password } = req.body;
    const db = await openDb();

    const user = await db.get("SELECT * FROM users WHERE email = ?", email);

    if (!user) {
        return res.status(400).json({ error: "Email ou senha inválidos", email});
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
        expiresIn: "2h",
    });

    return res.json({ message: "Login efetuado!", token });
})

export default router;