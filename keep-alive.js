const https = require('https');

const URL = process.env.RENDER_EXTERNAL_URL;

if (URL) {
  console.log(`Iniciando keep-alive para: ${URL}`);
  setInterval(() => {
    https.get(URL, (res) => {
      console.log(`Ping em ${URL} - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Erro no ping: ${err.message}`);
    });
  }, 14 * 60 * 1000); // 14 minutos (o Render suspende após 15 minutos de inatividade)
} else {
  console.log("RENDER_EXTERNAL_URL não definida. Pulando keep-alive.");
}
