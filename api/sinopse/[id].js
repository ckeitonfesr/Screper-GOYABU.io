const axios = require("axios");
const cheerio = require("cheerio");

const SEARCH = "https://goyabu.io/wp-json/animeonline/search/";
const NONCE = "5ecb5079b5";

function slugifyTitle(title = "") {
  return title
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-") // tudo que não for letra/numero vira "-"
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveAnimeById(id) {
  // 1) Busca no endpoint do goyabu (você passou isso como base)
  const { data } = await axios.get(SEARCH, {
    params: { keyword: String(id), nonce: NONCE },
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json,text/plain,*/*",
    },
    timeout: 20000,
  });

  // pode vir objeto já parseado ou string
  const json = typeof data === "string" ? JSON.parse(data) : data;

  // formato esperado por você:
  // { "69624": { "title": "...", "url": "https://goyabu.io/anime/..." } }
  const item = json?.[String(id)] || null;

  if (!item) {
    return { found: false, title: "", url: "" };
  }

  let title = String(item.title || "").trim();
  let url = String(item.url || "").trim();

  if (!url && title) {
    url = `https://goyabu.io/anime/${slugifyTitle(title)}`;
  }

  return { found: true, title, url };
}

module.exports = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id || !/^\d+$/.test(String(id))) {
      return res.status(400).json({
        success: false,
        error: "ID inválido. Use apenas número.",
        example: "/api/sinopse/69698",
      });
    }

    // 2) Resolve title + url do anime pela API do site
    const resolved = await resolveAnimeById(id);

    if (!resolved.found || !resolved.url) {
      return res.status(404).json({
        success: false,
        id,
        error: "Anime não encontrado pelo ID (search).",
      });
    }

    // 3) Agora abre a página base do anime (/anime/slug)
    const { data: html } = await axios.get(resolved.url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,*/*",
      },
      timeout: 20000,
    });

    const $ = cheerio.load(html);

    const full = $(".sinopse-full").text().trim();
    const short = $(".sinopse-short").text().trim();
    const sinopse = full || short || "Sinopse não encontrada";

    const image =
      $(".anime-thumb img").attr("src") ||
      $("meta[property='og:image']").attr("content") ||
      "";

    const title =
      $("h1").first().text().trim() ||
      $("meta[property='og:title']").attr("content") ||
      resolved.title ||
      "";

    // player iframe (igual seu teste)
    const playerLink =
      $("#player iframe").attr("src") ||
      $("iframe").first().attr("src") ||
      "";

    return res.status(200).json({
      success: true,
      id: String(id),
      title,
      url: resolved.url,
      image,
      sinopse,
      player: playerLink,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
};
