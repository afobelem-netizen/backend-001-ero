import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Configurações do GitHub
const GITHUB_TOKEN = process.env.MY_GITHUB_TOKEN; // Variável de ambiente no Render
const GITHUB_USER = "afobelem-netizen";          // teu usuário GitHub
const REPO = "inspecao-001-ero";                 // teu repositório
const FILE_PATH = "dados/inspecao.txt";          // caminho do arquivo dentro do repo

app.post("/salvar", async (req, res) => {
  try {
    const { DATA, HORA, EQUIPAMENTO, DESCRICAO } = req.body;

    if (!DATA || !HORA || !EQUIPAMENTO || !DESCRICAO) {
      return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    const linha = `${DATA};${HORA};${EQUIPAMENTO};${DESCRICAO}\n`;

    const urlArquivo = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${FILE_PATH}`;
    let shaArquivo = null;
    let conteudoAtual = "";

    try {
      // Verifica se arquivo já existe no GitHub
      const respostaGet = await axios.get(urlArquivo, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      });
      shaArquivo = respostaGet.data.sha;
      conteudoAtual = Buffer.from(respostaGet.data.content, "base64").toString("utf8");
    } catch {
      // Se não existir ainda, começamos com conteúdo vazio
      console.log("Arquivo ainda não existe no GitHub. Será criado agora.");
    }

    const novoConteudo = conteudoAtual + linha;
    const conteudoBase64 = Buffer.from(novoConteudo, "utf8").toString("base64");

    // Faz commit no GitHub
    await axios.put(
      urlArquivo,
      {
        message: "Nova inspeção registrada via app",
        content: conteudoBase64,
        sha: shaArquivo || undefined,
      },
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );

    res.json({ sucesso: true, mensagem: "Dados enviados e salvos no GitHub com sucesso!" });
  } catch (erro) {
    console.error(erro.response?.data || erro.message || erro);
    res.status(500).json({ erro: "Erro ao salvar dados no GitHub." });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
