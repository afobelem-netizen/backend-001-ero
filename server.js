import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Rota simples para testar
app.get("/", (req, res) => {
  res.send("Backend rodando de boa, parente! 😎");
});

// Exemplo de rota para salvar uma inspeção
app.post("/inspecao", (req, res) => {
  const dados = req.body;
  console.log("Nova inspeção:", dados);
  res.json({ message: "Inspeção recebida com sucesso!", dados });
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));