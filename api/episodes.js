const { Agent, setGlobalDispatcher } = require("undici");

setGlobalDispatcher(
  new Agent({
    keepAliveTimeout: 30_000,
    keepAliveMaxTimeout: 30_000,
    connections: 50,
  })
);

const AJAX = "https://goyabu.io/wp-admin/admin-ajax.php";
const BASE = "https://goyabu.io";
const TIMEOUT_MS = 12000;

function abs(base, path) {
  if (!path) return "";
  return /^https?:\/\//i.test(path) ? path : base + path;
}

module.exports = async (req, res) => {
  try {
    const animeId = String(req.query.anime_id || "").trim();
    if (!/^\d+$/.test(animeId)) {
      return res.status(400).json({ error: "anime_id inválido" });
    }

    const url = `${AJAX}?action=get_anime_episodes&anime_id=${animeId}`;

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, {
        signal: ac.signal,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": "https://goyabu.io/",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
        redirect: "follow",
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      // repassa o status do upstream (ajuda debug e rate-limit)
      return res.status(response.status).json({ error: `upstream ${response.status}` });
    }

    const ct = response.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) {
      const preview = (await response.text()).slice(0, 200);
      return res.status(502).json({ error: "upstream não retornou JSON", preview });
    }

    const data = await response.json();

    if (data?.success && Array.isArray(data.data)) {
      data.data = data.data.map((ep) => ({
        id: ep?.id,
        episodio: ep?.episodio,
        link: abs(BASE, ep?.link),
        type: ep?.type,
        episode_name: ep?.episode_name,
        audio: ep?.audio,
        imagem: abs(BASE, ep?.imagem),
        update: ep?.update,
        status: ep?.status,
      }));
    }

    return res.status(200).json(data);
  } catch (err) {
    const isTimeout = String(err?.name || "").includes("AbortError");
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? "timeout no upstream" : String(err?.message || err),
    });
  }
};
