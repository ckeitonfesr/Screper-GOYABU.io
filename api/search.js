const axios = require("axios");
const cheerio = require("cheerio");

const SEARCH = "https://goyabu.io/wp-json/animeonline/search/";
const NONCE = "5ecb5079b5";

async function fetchSinopse(animeUrl) {
  try {
    const { data } = await axios.get(animeUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);

    const full = $(".sinopse-full").text().trim();
    const short = $(".sinopse-short").text().trim();

    return full || short || "";
  } catch {
    return "";
  }
}

module.exports = async (req, res) => {
  try {
    const keyword = String(req.query.keyword || "").trim();
    if (!keyword) {
      res.status(400).json({ error: "keyword vazio" });
      return;
    }

    const url = new URL(SEARCH);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("nonce", NONCE);

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" }
    });

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json(data);
    }

    const enriched = await Promise.all(
      data.map(async (anime) => {
        const link = anime.link || anime.url || anime.permalink;
        const sinopse = link ? await fetchSinopse(link) : "";

        return {
          ...anime,
          sinopse
        };
      })
    );

    res.json(enriched);

  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
};
