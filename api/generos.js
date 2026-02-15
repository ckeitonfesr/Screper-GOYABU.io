const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://goyabu.io";

function genreUrl(genero) {
  return `${BASE}/generos/${genero}`;
}

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
      Referer: BASE + "/",
    },
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: (s) => s >= 200 && s < 400,
  });
  return data;
}

module.exports = async (req, res) => {
  try {
    const genero = String(req.query.genero || "").trim().toLowerCase();
    if (!genero) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Use ?genero=acao" }));
      return;
    }

    const html = await fetchHtml(genreUrl(genero));
    const $ = cheerio.load(html);

    const animes = [];
    $(".boxAN").each((_, el) => {
      const a = $(el).find("a").first();
      const titulo = $(el).find(".title").first().text().trim();
      const url = a.attr("href");
      if (titulo && url) animes.push({ titulo, url });
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.end(JSON.stringify({ genero, total: animes.length, data: animes }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: String(err?.message || err) }));
  }
};
