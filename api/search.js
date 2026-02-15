const axios = require("axios");
const cheerio = require("cheerio");

const SEARCH = "https://goyabu.io/wp-json/animeonline/search/";
const NONCE = "5ecb5079b5";

// Função para buscar gêneros de um anime pelo slug
async function getGenerosDoAnime(slug) {
  try {
    const url = `https://goyabu.io/anime/${slug}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const generos = [];

    $('.filter-btn[href*="generos"]').each((i, el) => {
      const genero = $(el).text().trim();
      if (genero) generos.push(genero);
    });

    return generos;
  } catch (error) {
    return [];
  }
}

module.exports = async (req, res) => {
  try {
    const keyword = String(req.query.keyword || "").trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: "keyword vazio"
      });
    }

    console.log(`\n🔍 Buscando: "${keyword}"`);

    // 1️⃣ Faz a busca na API
    const url = new URL(SEARCH);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("nonce", NONCE);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      }
    });

    const data = await response.json();

    // Se não encontrou nada
    if (!data || !data.length) {
      return res.status(200).json([]);
    }

    console.log(`📊 Encontrados ${data.length} resultados. Buscando gêneros...`);

    // 2️⃣ Para cada resultado, busca os gêneros
    const resultadosComGeneros = [];
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      console.log(`   [${i+1}/${data.length}] ${item.title}...`);
      
      const generos = await getGenerosDoAnime(item.slug);
      
      resultadosComGeneros.push({
        id: item.id,
        slug: item.slug,
        titulo: item.title,
        thumb: item.thumb || null,
        url: `https://goyabu.io/anime/${item.slug}`,
        generos: generos.length ? generos : ["Não informado"]
      });
      
      // Delay pequeno para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n✅ Retornando ${resultadosComGeneros.length} resultados com gêneros`);
    
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(resultadosComGeneros);

  } catch (err) {
    console.error("Erro:", err.message);
    return res.status(500).json({
      success: false,
      error: String(err?.message || err)
    });
  }
};
