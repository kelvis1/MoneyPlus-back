import express from "express";
import cors from "cors";
import authRoutes from "./backend/routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());



app.use("/auth", authRoutes);


// const port = 3000;

// app.listen(port, () => {
//   console.log("Server is running");
// });

export default app;