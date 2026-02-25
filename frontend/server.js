import express from 'express';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const URL_APP = process.env.RENDER_EXTERNAL_URL;

// Lógica de Keep-Alive (Self-Ping)
if (URL_APP) {
    console.log(`Iniciando monitoramento keep-alive para: ${URL_APP}`);
    setInterval(() => {
        https.get(URL_APP, (res) => {
            console.log(`Ping de manutenção: Status ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Erro no ping de manutenção: ${err.message}`);
        });
    }, 14 * 60 * 1000); // 14 minutos
}

// Serve os arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Lida com qualquer rota enviando o index.html (essencial para SPAs como React)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
