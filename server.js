import express from "express";
import fs from "fs-extra";
import path from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Caminho do arquivo
const pastaDados = path.join(process.cwd(), "dados");
const arquivo = path.join(pastaDados, "inspecao.txt");

// Garante que a pasta existe
await fs.ensureDir(pastaDados);

// Rota para receber os dados do formulário
app.post("/salvar", async (req, res) => {
  try {
    const { DATA, HORA, EQUIPAMENTO, DESCRICAO } = req.body;

    if (!DATA || !HORA || !EQUIPAMENTO || !DESCRICAO) {
      return res.status(400).json({ erro: "Campos incompletos." });
    }

    const linha = `${DATA};${HORA};${EQUIPAMENTO};${DESCRICAO}\n`;

    await fs.appendFile(arquivo, linha, "utf8");

    res.json({ sucesso: true, mensagem: "Dados salvos com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao salvar os dados." });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
