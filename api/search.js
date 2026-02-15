const axios = require("axios");
const cheerio = require("cheerio");

async function getGeneros(slug) {
  try {
    const { data } = await axios.get(`https://goyabu.io/anime/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 3000
    });
    const $ = cheerio.load(data);
    const generos = [];
    $('.filter-btn[href*="generos"]').each((i, el) => {
      const genero = $(el).text().trim();
      if (genero) generos.push(genero);
    });
    return generos;
  } catch {
    return [];
  }
}

module.exports = async (req, res) => {
  try {
    const keyword = String(req.query.keyword || "").trim().toLowerCase();
    if (!keyword) return res.status(400).json({ error: "keyword vazio" });

    const slug = keyword.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const url = `https://goyabu.io/anime/${slug}`;
    
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
      validateStatus: () => true
    });

    if (data.includes('404') || data.includes('não encontrada')) {
      return res.status(200).json([]);
    }

    const $ = cheerio.load(data);
    const generos = [];
    
    $('.filter-btn[href*="generos"]').each((i, el) => {
      const genero = $(el).text().trim();
      if (genero) generos.push(genero);
    });

    const titulo = $('h1.text-hidden').first().text().trim() || slug;
    const thumb = $('meta[property="og:image"]').attr('content') || null;

    let id = null;
    $('script').each((i, el) => {
      const script = $(el).html() || '';
      const match = script.match(/post_id[=:]\s*(\d+)/);
      if (match) id = match[1];
    });

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json([{
      id: id || slug.match(/\d+$/)?.[0] || null,
      slug,
      titulo,
      thumb,
      url: `https://goyabu.io/anime/${slug}`,
      generos: generos.length ? generos : ["Não informado"]
    }]);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
