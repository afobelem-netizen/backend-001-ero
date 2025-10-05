import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÕES DO GITHUB
const GITHUB_USER = "afobelem-netizen"; // teu usuário
const REPO = "backend-inspecao";        // teu repositório
const FILE_PATH = "dados/inspecoes.txt"; // caminho dentro do repo
const TOKEN = process.env.GITHUB_TOKEN;  // o token vai ficar guardado no Render

// ROTA RAIZ
app.get("/", (req, res) => {
  res.send("Backend rodando de boa, parente! 😎");
});

// ROTA DE INSPEÇÃO
app.post("/inspecao", async (req, res) => {
  try {
    const dados = req.body;
    const dataAtual = new Date().toLocaleString("pt-BR");

    const linha = `\n[${dataAtual}] Equipamento: ${dados.equipamento}, Status: ${dados.status}, Obs: ${dados.observacao}`;

    // 1️⃣ Pega o conteúdo atual do arquivo (se existir)
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${TOKEN}` },
    });

    let sha = null;
    let conteudoAntigo = "";

    if (response.ok) {
      const json = await response.json();
      sha = json.sha;
      conteudoAntigo = Buffer.from(json.content, "base64").toString("utf8");
    }

    // 2️⃣ Junta o conteúdo antigo com o novo
    const novoConteudo = conteudoAntigo + linha;

    // 3️⃣ Envia pro GitHub
    const upload = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Nova inspeção adicionada: ${dados.equipamento}`,
        content: Buffer.from(novoConteudo).toString("base64"),
        sha: sha,
      }),
    });

    if (!upload.ok) throw new Error("Erro ao enviar para o GitHub");

    res.json({ message: "Inspeção salva no GitHub com sucesso! ✅" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ message: "Erro ao salvar inspeção no GitHub", erro: erro.message });
  }
});

// PORTA
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
