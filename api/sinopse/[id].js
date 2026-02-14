const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://goyabu.io/anime/";

module.exports = async (req, res) => {
    try {
        // Pega o ID diretamente da URL (ex: /api/sinopse/overlord-4-dublado-online)
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'ID não fornecido'
            });
        }

        // Constrói a URL completa do Goyabu
        const url = BASE_URL + id;
        console.log(`Buscando: ${url}`);

        // Faz a requisição para a página do anime
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        // Carrega o HTML com cheerio
        const $ = cheerio.load(data);

        // Extrai a sinopse (tentando diferentes seletores)
        let sinopse = $(".sinopse-full").text().trim();
        
        if (!sinopse) {
            sinopse = $(".sinopse-short").text().trim();
        }
        
        if (!sinopse) {
            sinopse = $(".entry-content p").first().text().trim();
        }
        
        if (!sinopse) {
            sinopse = $("meta[name='description']").attr("content");
        }

        // Limpa a sinopse (remove espaços extras)
        sinopse = sinopse.replace(/\s+/g, ' ').trim();

        // Retorna o resultado
        return res.status(200).json({
            success: true,
            data: {
                id: id,
                url: url,
                sinopse: sinopse || "Sinopse não encontrada"
            }
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        
        // Tratamento específico para erro 404 (página não encontrada)
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                error: 'Anime não encontrado. Verifique o ID.'
            });
        }

        // Outros erros
        return res.status(500).json({
            success: false,
            error: error?.message || "Erro interno do servidor"
        });
    }
};
