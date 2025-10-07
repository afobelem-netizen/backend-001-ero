import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(".")); // Servir o index.html

// Configurações do GitHub
const GITHUB_TOKEN = process.env.MY_GITHUB_TOKEN;
const GITHUB_USER = "afobelem-netizen";
const REPO = "inspecao-001-ero";
const FILE_PATH = "dados/inspecao.txt";

app.post("/api/inspecoes", async (req, res) => {
  try {
    const { data, hora, equipamento, descricao } = req.body;

    if (!data || !hora || !equipamento || !descricao) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    // Monta a linha de registro
    const registro = `${data};${hora};${equipamento};${descricao};${new Date().toISOString()}\n`;

    const urlArquivo = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`;
    let shaArquivo = null;
    let conteudoAtual = "";

    try {
      // Tenta obter o arquivo existente
      const respostaGet = await axios.get(urlArquivo, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      });
      shaArquivo = respostaGet.data.sha;
      conteudoAtual = Buffer.from(respostaGet.data.content, "base64").toString("utf8");
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("📄 Arquivo ainda não existe no GitHub. Será criado agora.");
      } else {
        console.error("❌ Erro ao acessar o arquivo:", err.response?.data || err.message);
        throw err;
      }
    }

    // Cria novo conteúdo concatenando os registros
    const novoConteudo = conteudoAtual + registro;
    const conteudoBase64 = Buffer.from(novoConteudo, "utf8").toString("base64");

    // Faz o commit no GitHub
    await axios.put(
      urlArquivo,
      {
        message: "Nova inspeção registrada via app",
        content: conteudoBase64,
        sha: shaArquivo || undefined,
      },
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );

    res.json({ sucesso: true, mensagem: "✅ Inspeção salva com sucesso no GitHub!" });
  } catch (erro) {
    console.error("❌ Erro geral:", erro.response?.data || erro.message || erro);
    res.status(500).json({ erro: "Erro ao salvar inspeção no GitHub." });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
