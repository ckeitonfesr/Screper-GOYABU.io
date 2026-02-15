const AJAX = "https://goyabu.io/wp-admin/admin-ajax.php";
const BASE = "https://goyabu.io";

function absUrl(u) {
  if (!u) return "";
  u = String(u).trim();
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("/")) return BASE + u;
  return BASE + "/" + u;
}

function mapStatus(s) {
  return String(s ?? "").trim() === "1"
    ? "em_lancamento"
    : "finalizado";
}

module.exports = async (req, res) => {
  try {
    const animeId = String(req.query.anime_id || "").trim();

    if (!/^\d+$/.test(animeId)) {
      return res.status(400).json({
        success: false,
        error: "anime_id inválido"
      });
    }

    const url = `${AJAX}?action=get_anime_episodes&anime_id=${animeId}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Referer: BASE + "/"
      }
    });

    const raw = await response.text();

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    const data = JSON.parse(raw);

    if (data?.success && Array.isArray(data.data)) {
      data.data = data.data.map(ep => ({
        id: ep.id,
        episodio: ep.episodio,
        link: absUrl(ep.link),
        audio: ep.audio,
        imagem: absUrl(ep.imagem),
        update: ep.update,
        status: mapStatus(ep.status)
      }));
    }

    return res.status(200).send(JSON.stringify(data));

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
