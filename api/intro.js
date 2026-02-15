module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const base = "https://anime-api-kappa-one.vercel.app";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Anime API • Developer Docs</title>

<style>
:root{
  --bg:#06080f;
  --panel:#0f1624;
  --panel2:#141c2f;
  --accent:#8b5cf6;
  --accent2:#6366f1;
  --text:#eaf1ff;
  --muted:#94a3b8;
  --line:rgba(255,255,255,.08);
  --radius:16px;
}
*{box-sizing:border-box}
body{
  margin:0;
  font-family:system-ui,-apple-system,Segoe UI,Roboto;
  background:linear-gradient(180deg,#04060d,#0b1220);
  color:var(--text);
}
.container{
  max-width:1100px;
  margin:auto;
  padding:30px 18px 60px;
}
header{
  background:linear-gradient(135deg,var(--panel),var(--panel2));
  padding:28px;
  border-radius:var(--radius);
  border:1px solid var(--line);
  margin-bottom:28px;
}
h1{
  margin:0;
  font-size:28px;
  letter-spacing:.5px;
}
.subtitle{
  margin-top:10px;
  color:var(--muted);
  line-height:1.6;
}
.section{
  background:var(--panel);
  padding:22px;
  border-radius:var(--radius);
  border:1px solid var(--line);
  margin-bottom:20px;
  transition:.25s;
}
.section:hover{
  transform:translateY(-3px);
  box-shadow:0 15px 40px rgba(0,0,0,.4);
}
.section h2{
  margin:0 0 12px;
  font-size:18px;
  color:var(--accent);
}
.code{
  background:#000;
  padding:12px;
  border-radius:12px;
  font-family:monospace;
  font-size:13px;
  overflow:auto;
  border:1px solid var(--line);
  margin-top:10px;
}
.flow{
  display:grid;
  gap:18px;
}
.step{
  padding:18px;
  border-radius:var(--radius);
  background:var(--panel2);
  border:1px solid var(--line);
}
.step h3{
  margin:0 0 8px;
  color:var(--accent2);
}
footer{
  text-align:center;
  margin-top:40px;
  color:var(--muted);
  font-size:13px;
}
.badge{
  display:inline-block;
  background:var(--accent);
  padding:4px 10px;
  border-radius:20px;
  font-size:12px;
  margin-left:8px;
}
@media(max-width:768px){
  h1{font-size:22px}
}
</style>
</head>

<body>
<div class="container">

<header>
<h1>🚀 Anime API Documentation <span class="badge">v3</span></h1>
<div class="subtitle">
API completa para busca de animes, episódios e vídeo.<br>
Base URL: <strong>${base}</strong>
</div>
</header>

<div class="section">
<h2>🔎 1️⃣ Buscar Anime pelo Nome</h2>
<p>Primeiro você deve buscar o anime usando o nome.</p>
<div class="code">${base}/api/search?keyword=overlord</div>
<p>→ Retorna lista de animes com <strong>id</strong>.</p>
</div>

<div class="section">
<h2>📺 2️⃣ Buscar Episódios</h2>
<p>Depois de obter o <strong>anime_id</strong>, busque os episódios:</p>
<div class="code">${base}/api/episodes?anime_id=40927</div>
<p>→ Retorna todos os episódios com <strong>episode_id</strong>.</p>
</div>

<div class="section">
<h2>🎥 3️⃣ Buscar Vídeo do Episódio</h2>
<p>Agora use o <strong>episode_id</strong> para obter o link do vídeo:</p>
<div class="code">${base}/api/episode-video?episode_id=40930</div>
<p>→ Retorna <strong>video_url</strong> pronto para usar no player.</p>
</div>

<div class="section">
<h2>📖 Buscar Sinopse</h2>
<div class="code">${base}/api/sinopse?nome=Overlord-4-Dublado</div>
</div>

<div class="section">
<h2>📅 Lançamentos Recentes</h2>
<div class="code">${base}/api/lancamentos?pagina=1&limite=20</div>
</div>

<div class="section">
<h2>🎭 Buscar por Gênero</h2>
<div class="code">${base}/api/generos?genero=acao</div>
</div>

<div class="section">
<h2>⚙️ Fluxo Completo (Ordem Correta)</h2>
<div class="flow">

<div class="step">
<h3>PASSO 1</h3>
Buscar anime pelo nome → pegar <strong>anime_id</strong>
</div>

<div class="step">
<h3>PASSO 2</h3>
Buscar episódios usando <strong>anime_id</strong> → pegar <strong>episode_id</strong>
</div>

<div class="step">
<h3>PASSO 3</h3>
Buscar vídeo usando <strong>episode_id</strong>
</div>

</div>
</div>

<footer>
🔥 Desenvolvido por <strong>Lopes • DVHACKZZ</strong><br>
Full Stack Anime API Developer
</footer>

</div>
</body>
</html>`;

  return res.status(200).end(html);
};
