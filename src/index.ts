import express, { Request, Response } from "express";
import { connectToDatabase } from "./config/database";
import authRouter from "./routes/authRoutes";
import cors from 'cors';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Olá, backend do FindIt rodando!");
});

app.use('/api/v1/auth', authRouter); 

const startServer = async () => {
  await connectToDatabase(); 
  app.listen(PORT, () => {
    console.log(` Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();