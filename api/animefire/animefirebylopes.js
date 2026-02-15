import axios from "axios";
import cheerio from "cheerio";

const BASE_URL = "https://animefire.io";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Referer": BASE_URL,
  "Connection": "keep-alive"
};

// ==================== ÚLTIMOS EPISÓDIOS ====================
async function getUltimosEpisodios(page = 1) {
  const url =
    page === 1
      ? BASE_URL
      : `${BASE_URL}/home/${page}`;

  const { data } = await axios.get(url, {
    headers: HEADERS,
    timeout: 15000,
  });

  const $ = cheerio.load(data);
  const episodios = [];

  $(".divCardUltimosEpsHome").each((i, el) => {
    const card = $(el);
    const link = card.find("a").first();
    const href = link.attr("href");

    if (!href) return;

    const titulo =
      card.find(".animeTitle").text().trim() ||
      card.attr("title") ||
      "N/A";

    const numEp =
      card.find(".numEp").text().trim() ||
      "N/A";

    const imgSrc =
      card.find("img").attr("src") ||
      card.find("img").attr("data-src") ||
      "";

    const imagem = imgSrc.startsWith("http")
      ? imgSrc
      : `${BASE_URL}${imgSrc}`;

    const match = href.match(
      /\/animes\/(.+?)\/(\d+)$/
    );

    if (!match) return;

    episodios.push({
      id: i + 1,
      titulo,
      animeId: match[1],
      episodio: match[2] || numEp,
      url: `${BASE_URL}${href}`,
      imagem,
    });
  });

  return {
    currentPage: page,
    total: episodios.length,
    episodios,
  };
}

// ==================== HANDLER ====================
export default async function handler(req, res) {
  const { page } = req.query;

  try {
    const data = await getUltimosEpisodios(
      parseInt(page) || 1
    );

    return res.status(200).json({
      status: true,
      ...data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Erro ao buscar episódios",
      error: error.message,
    });
  }
}
