import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÕES DO GITHUB
const GITHUB_USER = "afobelem-netizen"; // teu usuário
const REPO = "backend-inspecao";        // teu repositório
const TOKEN = process.env.GITHUB_TOKEN;  // token guardado no Render

// ROTA RAIZ
app.get("/", (req, res) => {
  res.send("Backend rodando de boa, parente! 😎");
});

// ROTA DE INSPEÇÃO
app.post("/inspecao", async (req, res) => {
  try {
    const dados = req.body;
    const agora = new Date();

    // 📅 gera nome do arquivo por dia (ex: inspecoes-05-10-2025.txt)
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const nomeArquivo = `inspecoes-${dia}-${mes}-${ano}.txt`;
    const FILE_PATH = `dados/${nomeArquivo}`;

    const dataHora = agora.toLocaleString("pt-BR");
    const linha = `\n[${dataHora}] Equipamento: ${dados.equipamento}, Status: ${dados.status}, Obs: ${dados.observacao}`;

    // 1️⃣ Tenta buscar o arquivo no GitHub
    let sha = null;
    let conteudoAntigo = "";

    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${TOKEN}` },
    });

    if (response.ok) {
      const json = await response.json();
      sha = json.sha;
      conteudoAntigo = Buffer.from(json.content, "base64").toString("utf8");
    } else if (response.status === 404) {
      // arquivo ainda não existe, será criado
      sha = null;
      conteudoAntigo = "";
    } else {
      throw new Error("Erro ao acessar o arquivo no GitHub");
    }

    // 2️⃣ Junta o conteúdo antigo com a nova linha
    const novoConteudo = conteudoAntigo + linha;

    // 3️⃣ Envia/cria o arquivo no GitHub
    const upload = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Inspeção registrada em ${nomeArquivo}`,
        content: Buffer.from(novoConteudo).toString("base64"),
        sha: sha, // se null → cria o arquivo
      }),
    });

    if (!upload.ok) throw new Error("Erro ao enviar para o GitHub");

    res.json({ message: `Inspeção salva no GitHub com sucesso em ${nomeArquivo} ✅` });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ message: "Erro ao salvar inspeção no GitHub", erro: erro.message });
  }
});

// PORTA
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
