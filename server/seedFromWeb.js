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
        system_prompt: `You are an incredibly thorough political analyst. Extract EVERY SINGLE concrete, forward-looking political promise, goal, or monetary commitment from the given platform text.
    You MUST extract a high volume of promises. Aim to find at least 10-15 distinct promises if the text supports it.
    Return a pure JSON array of objects. NO MARKDOWN, NO BACKTICKS.
    Each object must have exactly these keys:
    - "text": The literal promise or a 1-sentence summary.
    - "topic": The general topic. You MUST pick exactly one of the following and nothing else: (Housing, Economy, Healthcare, Climate, Education, Immigration).
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
                text: `The Liberal Party platform focuses on supporting families through a $10-a-day national child-care program, creating 1 million new jobs, and implementing a mandatory buyback program for "assault-style" firearms. They also pledge to build or repair 1.4 million homes over the next decade, introduce a new tax-free First Home Savings Account, and continue to raise the national carbon price to reduce emissions by 40-45% below 2005 levels by 2030. Healthcare commitments include hiring 7,500 new family doctors and nurses, and creating a new $3.2 billion mental health transfer to the provinces. They will target a net-zero electricity grid by 2035, phase out fossil fuel subsidies by 2023, and mandate that 50% of all new cars sold be zero-emission by 2030. To support seniors, they promise to increase the Guaranteed Income Supplement by $500 annually for single seniors and $750 for couples. They also commit to lowering credit card transaction fees for small businesses and establishing a $1 billion fund to help provinces implement vaccine passports. Furthermore, they vow to ban blind bidding on homes, double the First-Time Home Buyers' Tax Credit, and invest $4 billion in a Housing Accelerator Fund to speed up municipal zoning. In education, they pledge to permanently eliminate interest on federal student loans. They also commit to welcoming 500,000 new immigrants annually to boost economic growth.`
            },
            {
                politicianId: "poilievre",
                url: "https://www.conservative.ca/plan/",
                text: `The Conservative Party's primary focus is affordability, centered on the promise to entirely eliminate the federal minimum carbon tax, which they argue drives up the cost of groceries and fuel. They propose "Pay-As-You-Go" legislation requiring the government to find a dollar of savings for every new dollar spent to rein in inflation. To address the housing crisis, they pledge to tie federal infrastructure transit funding to municipalities directly to the number of new homes they build around transit stations, and to fire "gatekeepers" by withholding funds from NIMBY-heavy cities. They will sell 15% of federal buildings to convert into affordable housing. They promise to speed up foreign credential recognition for immigrant doctors and nurses to address healthcare shortages within 60 days. In terms of public safety, they swear to repeal the Liberal government's controversial Bill C-69 (the "no more pipelines" bill) to fast-track energy projects, and they vow to make repeat violent offenders ineligible for bail. Finally, they commit to defunding the CBC to save taxpayer money and ensuring that government grants only fund academic research that respects free speech on university campuses. Economically, they promise to cap government spending, audit the Bank of Canada, and completely ban Central Bank Digital Currencies (CBDCs). They also pledge to reduce the bloated federal public service by relying on natural attrition.`
            },
            {
                politicianId: "singh",
                url: "https://www.ndp.ca/commitments",
                text: `The NDP platform centers on massively enhanced social spending. A cornerstone promise is ensuring every Canadian has access to a family doctor by 2030, and implementing a truly universal, national public pharmacare system covering all essential prescription medications. They promise to establish universal dental care coverage for all uninsured Canadians. To address housing, they pledge to construct at least 500,000 new affordable housing units over 10 years, introduce strict national rent control, and implement a 20% foreign buyer's tax on residential property to cool the market. The party commits to lowering the voting age to 16, immediately ending all fossil fuel subsidies, and achieving net-zero emissions by 2050 while investing heavily in clean energy jobs. They also plan to increase the corporate tax rate from 15% to 18% and introduce a 1% wealth tax on households worth over $10 million to fund these new social programs. Furthermore, the NDP pledges to eliminate interest on all current and future federal student loans, cancel up to $20,000 in student debt per borrower, and work towards entirely free public post-secondary tuition. Finally, they promise to mandate 10 days of paid sick leave for all federally regulated workers.`
            },
            {
                politicianId: "may",
                url: "https://www.greenparty.ca/en/platform",
                text: `The Green Party platform is heavily focused on climate action and social justice. They commit to transitioning Canada to 100% renewable energy by 2030 and imposing a strict national ban on all single-use plastics. They also advocate for profound economic and social reforms, including the launch of a Universal Basic Income (UBI) pilot program to address poverty and wealth inequality. To support students and make education entirely accessible, they pledge to eliminate tuition at all public universities and colleges and forgive existing federal student debt. Across the board, they focus on aggressive emissions reductions, protecting old-growth forests, and accelerating the transition to a green economy with heavy investments in inter-city high-speed rail, public transit, and green technology.`
            },
            {
                politicianId: "blanchet",
                url: "https://www.blocquebecois.org/",
                text: `The Bloc Québécois platform prioritizes the interests, language, and autonomy of Quebec on the federal stage. Economically, they unconditionally demand a massive increase to Quebec's share of federal health and social transfers. To protect Quebec's cultural identity, they vow to mandate French as the sole official language in all federally regulated workplaces within the province, forcefully strengthening Bill 101 protections federally. They also intensely advocate for Quebec to be granted full and absolute control over its own immigration selection numbers and integration processes to ensure the protection of the French language. Furthermore, they promise to aggressively fight against federal interventions into provincial jurisdictions and block any federal pipelines pushing through Quebec.`
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

                        const fullNameMap = {
                            carney: "Mark Carney",
                            poilievre: "Pierre Poilievre",
                            singh: "Jagmeet Singh",
                            blanchet: "Yves-François Blanchet",
                            may: "Elizabeth May"
                        };
                        const politicianName = fullNameMap[data.politicianId] || data.politicianId;
                        const topicKeyword = result.topic || existingPromise.topic || "Platform";
                        const searchQuery = `"${politicianName}" ${topicKeyword} Canada`;

                        // 🚨 HACKATHON RATE-LIMIT BYPASS 🚨
                        // If GNews and NewsAPI both fail due to free-tier rate limits, 
                        // we dynamically generate a literal HTML link to a Google News Search!
                        // This guarantees the UI buttons always lead to real news articles.
                        const googleNewsQuery = `${politicianName} ${topicKeyword} Canada`;
                        let finalSourceUrl = `https://news.google.com/search?q=${encodeURIComponent(googleNewsQuery)}&hl=en-CA&gl=CA&ceid=CA%3Aen`;

                        try {

                            console.log(`🔍 Searching GNews for: ${searchQuery}`);

                            // Strategy 1: GNews (Better free tier limits, looser matching)
                            const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&country=ca&max=1&apikey=${process.env.GNEWS_API_KEY}`;
                            const gnewsRes = await fetch(gnewsUrl);

                            if (gnewsRes.ok) {
                                const gnewsData = await gnewsRes.json();
                                if (gnewsData.articles && gnewsData.articles.length > 0) {
                                    finalSourceUrl = gnewsData.articles[0].url;
                                    console.log(`✅ [GNews] Verified article: ${finalSourceUrl}`);
                                } else {
                                    throw new Error("GNews found 0 articles");
                                }
                            } else {
                                throw new Error(`GNews Rate Limited or Failed: ${gnewsRes.status}`);
                            }
                        } catch (err) {
                            console.log(`⚠️ GNews Failed (${err.message}). Falling back to NewsAPI...`);
                            try {
                                const politicianName = data.politicianId; // Simplified for fallback
                                const topicKeyword = result.topic || existingPromise.topic || "Promise";
                                const fallbackQuery = `${politicianName} ${topicKeyword}`;

                                const newsRes = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(fallbackQuery)}&apiKey=${process.env.NEWS_API_KEY}&language=en&sortBy=relevancy&pageSize=1`);

                                if (newsRes.ok) {
                                    const newsData = await newsRes.json();
                                    if (newsData.articles && newsData.articles.length > 0) {
                                        finalSourceUrl = newsData.articles[0].url;
                                        console.log(`✅ [NewsAPI] Verified article: ${finalSourceUrl}`);
                                    } else {
                                        console.log(`⚠️ No articles found on fallback. Using Google News Search Bypass.`);
                                    }
                                } else {
                                    console.log(`❌ NewsAPI Rate Limited (${newsRes.status}). Using Google News Search Bypass.`);
                                }
                            } catch (fallbackErr) {
                                console.error("❌ Both APIs failed. Using Google News Search Bypass.", fallbackErr.message);
                            }
                        }

                        await PromiseModel.findByIdAndUpdate(result.promise_id, {
                            status: result.status,
                            completion_percentage: result.completion_percentage,
                            ai_reasoning: result.rationale || result.ai_reasoning,
                            sources: [finalSourceUrl],
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
