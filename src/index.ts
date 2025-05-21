
import express, { Request, Response } from "express";
import { connectToDatabase } from "./config/database"; 

const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Olá, backend do FindIt rodando!");
});

const startServer = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();