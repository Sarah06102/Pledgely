const axios = require("axios");
const cheerio = require("cheerio");

async function searchArticles(query) {
    console.log(`🔍 Searching for: ${query}`);

    try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
            params: {
                q: query,
                language: "en",
                sortBy: "relevancy",
                pageSize: 3,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        const articles = response.data.articles.map(a => ({
            title: a.title,
            url: a.url,
            content: a.description || a.content || ""
        }));

        console.log(`Found ${articles.length} articles:`, articles.map(a => a.title));
        return articles;

    } catch (error) {
        console.error(`NewsAPI error:`, error.response?.data || error.message);
        return [];
    }
}

async function scrapeArticle(url) {
    const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 10000
    });

    const $ = cheerio.load(data);
    $("script, style, nav, footer, header").remove();

    return $("article, main, p").text().replace(/\s+/g, " ").trim().substring(0, 5000);
}

module.exports = { searchArticles, scrapeArticle };