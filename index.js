import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

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


// app.use("/auth", authRoutes);


// const port = 3000;

// app.listen(port, () => {
//   console.log("Server is running");
// });

export default app;