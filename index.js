import express from "express";

const app = express();
const port = 3000; // You can change this to any port you prefer

app.get("/", (req, res) => {
  res.send("Hello, World! This is your Express API demo.");
});

app.listen(port, () => {
  console.log("Server is running");
});

//////////// Export app defaultly ///////////////////////////
export default app;