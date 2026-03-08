require("dotenv").config();
const mongoose = require("mongoose");
const PromiseModel = require("./models/Promise");
const backboardService = require("./services/backboard");

const BACKBOARD_BASE_URL = "https://app.backboard.io/api";

// Helper to interact with the Backboard REST API directly
async function backboardRequest(endpoint, method = "GET", body = null) {
    const url = `${BACKBOARD_BASE_URL}${endpoint}`;
    const headers = {
        "x-api-key": process.env.BACKBOARD_API_KEY,
        "Content-Type": "application/json"
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Backboard API error ${res.status}: ${err}`);
    }
    return res.json();
}

/**
 * Uses a dedicated Backboard.io Assistant to parse a giant wall of raw text
 * and extract all concrete political promises into JSON.
 */
async function extractPromisesWithBackboard(rawText, politicianId, sourceUrl) {
    console.log(`\n🤖 Sending text to Backboard for Promise Extraction...`);

    // 1. Create a specialized Extraction Assistant
    const assistant = await backboardRequest("/assistants", "POST", {
        name: "Platform Extractor",
        system_prompt: `You are an expert political analyst. Extract all concrete, forward-looking political promises or commitments from the given platform text.
    Return a pure JSON array of objects. NO MARKDOWN, NO BACKTICKS.
    Each object must have exactly these keys:
    - "text": The literal promise or a 1-sentence summary.
    - "topic": The general topic (Housing, Economy, Healthcare, Environment, Education, Immigration, Other).
    - "status": Always use "Pending".
    - "progress": Always use 0.
    
    If no promises are found, return an empty array [].`
    });

    const assistantId = assistant.assistant_id;

    // 2. Create a thread
    const thread = await backboardRequest(`/assistants/${assistantId}/threads`, "POST", {});
    const threadId = thread.thread_id;

    // 3. Send the raw text and get the response
    const response = await backboardRequest(`/threads/${threadId}/messages`, "POST", {
        content: rawText,
        stream: false
    });

    const aiContent = response.content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        const extractedPromises = JSON.parse(aiContent);
        console.log(`✅ Backboard successfully extracted ${extractedPromises.length} promises.`);

        // Append our politicianId and default DB fields
        return extractedPromises.map(p => ({
            text: p.text,
            topic: p.topic,
            politicianId: politicianId,
            status: p.status || "Pending",
            progress: p.progress || 0,
            completion_percentage: p.progress || 0,
            sources: [sourceUrl]
        }));
    } catch (err) {
        console.error("Failed to parse Backboard JSON response:", aiContent);
        throw new Error("Backboard did not return valid JSON array.");
    }
}

async function runSeed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // The web scraper is getting blocked by 404s/Timeouts on reputable journalistic sites (CBC, GlobalNews).
        // Instead, we will feed the Backboard extraction pipeline with raw text compilations of their platforms 
        // compiled from multiple highly-reputable sources (Macleans, CTV, Global).

        const platformTexts = [
            {
                politicianId: "carney",
                url: "https://liberal.ca/our-platform/",
                text: `The Liberal Party platform focuses on supporting families through a $10-a-day national child-care program, creating 1 million new jobs, and implementing a ban on "assault-style" firearms. They also pledge to build or repair 1.4 million homes, introduce a new tax-free First Home Savings Account, and continue to raise the national carbon price to reduce emissions. Healthcare commitments include hiring 7,500 new family doctors and nurses, and creating a new mental health transfer. They will target a net-zero electricity grid by 2035.`
            },
            {
                politicianId: "poilievre",
                url: "https://www.conservative.ca/about-us/governing-documents/",
                text: `The Conservative Party platform emphasizes economic sovereignty, energy independence, and consumer affordability. Key proposals include cutting the lowest income tax bracket from 15% to 12.75% and offering tax cuts on new homes and Canadian-made vehicles. A central promise is to eliminate the carbon tax entirely. The party aims to facilitate the construction of 2.3 million homes over five years by eliminating the federal GST on new homes and incentivizing cities. They will also tie immigration levels directly to housing availability.`
            },
            {
                politicianId: "singh",
                url: "https://www.ndp.ca/commitments",
                text: `The NDP platform centers on enhanced social spending. A massive commitment is ensuring every Canadian has access to a family doctor by 2030, and implementing a national public pharmacare system covering 100 commonly prescribed medications. To address housing, they pledge to construct three million new homes by 2030 and introduce national rent control. They plan to fund this by raising tax rates on corporations and individuals earning over $177,882, while waiving the GST on essential goods like groceries and internet bills.`
            }
        ];

        for (const data of platformTexts) {
            await PromiseModel.deleteMany({ politicianId: data.politicianId });
            console.log(`\n🗑️ Cleared old promises from DB for ${data.politicianId}.`);

            try {
                // 4. Extract Promises via Backboard
                const newPromises = await extractPromisesWithBackboard(data.text, data.politicianId, data.url);

                if (newPromises.length > 0) {
                    const inserted = await PromiseModel.insertMany(newPromises);
                    console.log(`🎉 Success! Saved ${inserted.length} reliable promises into MongoDB for ${data.politicianId}.`);

                    console.log(`🤖 Automatically running AI Audit on ${data.politicianId}'s promises...`);
                    const mappedPromises = inserted.map(p => ({
                        _id: p._id,
                        original_quote: p.text
                    }));

                    const auditResults = await backboardService.verifyPromises(mappedPromises);

                    for (const result of auditResults) {
                        const existingPromise = inserted.find(p => p._id.toString() === result.promise_id.toString());

                        // Dynamically fetch the top Canadian news article about this specific promise
                        let specificUrl = data.url; // Fallback to primary platform URL
                        try {
                            const fullNameMap = {
                                carney: "Mark Carney",
                                poilievre: "Pierre Poilievre",
                                singh: "Jagmeet Singh"
                            };
                            const politicianName = fullNameMap[data.politicianId] || data.politicianId;

                            // Extract key phrases from the actual promise text
                            const cleanedQuote = existingPromise.text.replace(/[^a-zA-Z0-9 ]/g, "");
                            const keyPhrase = cleanedQuote.split(' ').slice(0, 5).join(' ');

                            // Create a highly specific search query combining the politician and the exact promise phrasing, but without exact phrase quotes so it actually hits
                            const searchQuery = `"${politicianName}" AND ${keyPhrase}`;
                            console.log(`Searching NewsAPI for: ${searchQuery}`);
                            // Sort by relevancy to ensure the best match
                            const newsRes = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&apiKey=${process.env.NEWS_API_KEY}&language=en&sortBy=relevancy&pageSize=1`);
                            if (newsRes.ok) {
                                const newsData = await newsRes.json();
                                if (newsData.articles && newsData.articles.length > 0) {
                                    specificUrl = newsData.articles[0].url;
                                    console.log(`Found article: ${specificUrl}`);
                                } else {
                                    console.log(`No articles found for query. Falling back to platform URL.`);
                                }
                            } else {
                                const errText = await newsRes.text();
                                console.log(`NewsAPI Error (${newsRes.status}): ${errText}`);
                            }
                        } catch (err) {
                            console.error("News fetch error:", err.message);
                        }

                        await PromiseModel.findByIdAndUpdate(result.promise_id, {
                            status: result.status,
                            completion_percentage: result.completion_percentage,
                            ai_reasoning: result.rationale || result.ai_reasoning,
                            sources: [specificUrl],
                            last_updated: new Date()
                        });
                    }
                    console.log(`✅ Successfully completed end-to-end AI Audit pipeline for ${data.politicianId}!`);
                } else {
                    console.log(`⚠️ No promises were extracted for ${data.politicianId}.`);
                }
            } catch (err) {
                console.error(`❌ Failed processing ${data.politicianId}:`, err.message);
            }
        }

    } catch (err) {
        console.error("❌ Seeding Error:", err.message);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

runSeed();
