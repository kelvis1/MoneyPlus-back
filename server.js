import express from "express";
import cors from "cors";
import authRoutes from "./backend/routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());



app.use("/auth", authRoutes);


app.listen(8000, () => console.log("Backend rodando na porta 8000"));

export default app;